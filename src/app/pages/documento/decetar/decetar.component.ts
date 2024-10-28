import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { insertDTO } from 'src/app/_DTO/InsertDTO';
import { Accion } from 'src/app/_model/accion';
import { Organizacion } from 'src/app/_model/organizacion';
import { Prioridad } from 'src/app/_model/prioridad';
import { AccionService } from 'src/app/_service/accion.service';
import { DecretoService } from 'src/app/_service/decreto.service';
import { OrganizacionService } from 'src/app/_service/organizacion.service';
import { PrioridadService } from 'src/app/_service/prioridad.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-decetar',
  templateUrl: './decetar.component.html',
  styleUrls: ['./decetar.component.css']
})
export class DecetarComponent implements OnInit {

  decretoForm: FormGroup;
  organizaciones: Organizacion[] = [];
  prioridades: Prioridad[] = [];
  accionesDisponibles: Accion[] = [];
  idDocumento: any = '';
  codigoDecreto : any = '';
  minDate: Date;
  cargando : boolean = false;

  constructor(
    private fb: FormBuilder,
    private accionService: AccionService,
    private organizacionService: OrganizacionService,
    private prioridadService:PrioridadService,
    private decretoService: DecretoService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    this.inicializarFormulario();
    this.cargarDatosDelBackend();
    this.minDate = new Date(); // Fecha actual

  }

  getIdDocumento(): void {
    this.idDocumento = this.route.snapshot.paramMap.get('codigoDocumento');
    this.codigoDecreto = this.route.snapshot.paramMap.get('idDecreto');
  }

  inicializarFormulario() {
    this.getIdDocumento();
    this.decretoForm = this.fb.group({
      numeroDocumento: [this.idDocumento, Validators.required],
      numeroDecreto: [this.codigoDecreto, Validators.required],
      decretos: this.fb.array([])
    });
    this.agregarDecreto(); // Agregar el primer decreto por defecto

  }

  cargarDatosDelBackend() {
    forkJoin({
      organizaciones: this.organizacionService.getChildrenByCodigo(sessionStorage.getItem(environment.codigoOrganizacion)),
      prioridades: this.prioridadService.listar(),
      acciones: this.accionService.listar()
    }).subscribe({
      next: (result:any) => {
        this.organizaciones = result.organizaciones.data;
        if (this.organizaciones.length==0){
          this.router.navigate(['./principal/pendientes']);
          Swal.fire('LO SENTIMOS', `SE VALIDA QUE NO TIENE ORGANIZACIONES A SU MANDO!`, 'info');
        }
        this.prioridades = result.prioridades;
        this.accionesDisponibles = result.acciones.data;
        this.agregarDecreto(); // Agregamos el primer decreto después de cargar los datos
      },
      error: (error) => console.error('Error cargando datos:', error)
    });
  }

  get decretos() {
    return this.decretoForm.get('decretos') as FormArray;
  }

  crearDecretoFormGroup(): FormGroup {
    return this.fb.group({
      destinos: ['', Validators.required],
      prioridad: ['', Validators.required],
      fechaLimite: ['', [Validators.required]],
      acciones: this.fb.array(
        this.accionesDisponibles.map(accion =>
          this.fb.group({
            id: [accion.codigo],
            nombre: [accion.nombre],
            seleccionada: [false]
          })
        ),
        [this.alMenosUnaAccionSeleccionada]
      ),
      observacion: ['']
    });
  }

  alMenosUnaAccionSeleccionada(control: AbstractControl): ValidationErrors | null {
    const acciones = control as FormArray;
    const seleccionadas = acciones.controls.some(accion => accion.get('seleccionada')?.value === true);
    return seleccionadas ? null : { noAccionSeleccionada: true };
  }

  agregarDecreto() {
    if (this.accionesDisponibles.length > 0) {
      this.decretos.push(this.crearDecretoFormGroup());
    } else {
      console.error('No se pueden agregar decretos sin acciones disponibles');
    }
  }

  eliminarDecreto(index: number) {
    this.decretos.removeAt(index);
  }

  getDecretosControls() {
    return (this.decretoForm.get('decretos') as FormArray).controls;
  }

  getAccionesControls(decreto: AbstractControl) {
    return (decreto.get('acciones') as FormArray).controls;
  }


  onSubmit() {
    if (this.decretoForm.valid) {
      this.cargando = true;
      let dto : insertDTO= new insertDTO();
      dto.codigoDocumento = this.idDocumento;
      dto.codigoDecreto = this.codigoDecreto;
      dto.organizacionOrigen = sessionStorage.getItem(environment.codigoOrganizacion);

      const formValue = this.decretoForm.value; // capturamos el formulario

      // capturamos los decetros del form
      const decretosConAccionesSeleccionadas = formValue.decretos.map((decreto: any) => {
        const accionesSeleccionadas = decreto.acciones
          .filter((accion: any) => accion.seleccionada)
          .map((accion: any) => accion.id );

        return {
          ...decreto,
          acciones: accionesSeleccionadas
        };
      });

      dto.decretos = decretosConAccionesSeleccionadas;

      this.decretoService.decretarDocumento2(dto).subscribe((response:any)=> {
        if (response.httpStatus == 'CREATED'){
          this.cargando = false;
          this.router.navigate(["/principal/pendientes"])
          Swal.fire('OPERACION REALIZADA', response.message, 'info');
        }
        else {
          this.cargando = false;
          Swal.fire('LO SENTIMOS', response.message, 'info');
        }
      },(error: any) => {
        this.cargando = false;
        Swal.fire('LO SENTIMOS', 'SE PRESENTO UN INCONVENIENTE', 'warning');
      });

    } else {
      // Formulario inválido'
      this.marcarTodoComoTocado(this.decretoForm);
    }
  }

  marcarTodoComoTocado(formGroup: FormGroup | FormArray) {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.marcarTodoComoTocado(control);
      } else {
        control.markAsTouched();
      }
    });
  }

  eliminarOtrosDecretos(indexAConservar: number) {
    const decretosAEliminar = this.decretos.controls.filter((_, index) => index !== indexAConservar);

    decretosAEliminar.forEach(() => {
      this.decretos.removeAt(0); // Siempre se elimina el primero hasta que quede el seleccionado
    });
  }

  accionesInvalidas(decreto: AbstractControl): boolean {
    const acciones = decreto.get('acciones');
    return acciones ? acciones.invalid && acciones.touched : false;
  }

  disableOtherOptions: boolean = false; // Deshabilitar solo otras opciones

  onSelectionChange(event: any, i: number) {
    const selectedValues = event.value;

    if (selectedValues.includes('----')) {
      // Si selecciona "TODAS MIS UNIDADES", desmarcar otras opciones
      const decretoControl = this.decretos.at(i) as FormGroup;
      decretoControl.get('destinos')?.setValue(['----']);
      this.disableOtherOptions = true;
      // Eliminar todos los demás decretos excepto el seleccionado
      this.eliminarOtrosDecretos(i);
    } else {
      // Si se desmarca "TODAS MIS UNIDADES", habilitar las demás
      this.disableOtherOptions = false;
    }
  }
}
