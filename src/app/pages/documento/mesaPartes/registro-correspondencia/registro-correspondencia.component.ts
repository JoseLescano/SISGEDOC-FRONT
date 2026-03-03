import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CorrespondenciaOP } from 'src/app/_DTO/CorrespondenciaOP';
import { Clase } from 'src/app/_model/clase';
import { Organizacion } from 'src/app/_model/organizacion';
import { ClaseService } from 'src/app/_service/clase.service';
import { CorrespondenciaService } from 'src/app/_service/correspondencia.service';
import { OrganizacionService } from 'src/app/_service/organizacion.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro-correspondencia',
  templateUrl: './registro-correspondencia.component.html',
  styleUrls: ['./registro-correspondencia.component.css']
})
export class RegistroCorrespondenciaComponent implements OnInit {

  // Inicializar arrays vacíos para evitar errores de undefined
  remitentes: Organizacion[] = [];
  destinos: Organizacion[] = [];
  clases: Clase[] = [];

  cargando: boolean = false;
  mostrarTipoIdentidad: boolean = false;
  mostrarFormDatos: number | null = null; // Inicializar explícitamente
  corresp: CorrespondenciaOP = new CorrespondenciaOP();
  correspondenciaId: number = 0; // Inicializar con 0

  codigoOrganizacion: any = sessionStorage.getItem(environment.codigoOrganizacion);

  tipoDocumento: any[] = [
    { codigo: '0', nombre: 'RUC' },
    { codigo: '1', nombre: 'DNI' },
    { codigo: '2', nombre: 'CARNET EXTRANJERIA' },
    { codigo: '3', nombre: 'SIN DOCUMENTO' },
  ];

  form: FormGroup;

  constructor(
    private organizacionService: OrganizacionService,
    private claseService: ClaseService,
    private correspondenciaService: CorrespondenciaService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Inicializar el formulario en el constructor para evitar errores de undefined
    this.initFormBasic();
  }

  ngOnInit(): void {
    // Obtener el ID de la URL de forma segura
    const idParam = this.route.snapshot.paramMap.get('id');
    this.correspondenciaId = idParam ? +idParam : 0;

    if (this.codigoOrganizacion == '120210' || this.codigoOrganizacion == '12021001'
      || this.codigoOrganizacion == '12021002' || this.codigoOrganizacion == '02') {

      this.cargando = true;
      this.cargarDatosIniciales();

    } else {
      this.router.navigate(['/principal/dashboard']);
      Swal.fire('LO SENTIMOS', 'USTED NO CUENTA CON LOS PERMISOS CORRESPONDIENTES', 'info');
    }
  }

  // Crear formulario básico para evitar errores de undefined
  initFormBasic() {
    this.form = new FormGroup({
      'id': new FormControl(0),
      'origen': new FormControl('', [Validators.required]),
      'tipoIdentidad': new FormControl(''),
      'nombreCortoEntidad': new FormControl('', [Validators.minLength(5)]),
      'numeroIdentidad': new FormControl('', [Validators.minLength(8)]),
      'nombreCompletoEntidad': new FormControl('', [Validators.minLength(5)]),
      'destino': new FormControl('', [Validators.required]),
      'fechaDocumento': new FormControl('', [Validators.required]),
      'clase': new FormControl('', [Validators.required]),
      'indicativo': new FormControl('', [Validators.minLength(3)]),
      'folio': new FormControl('', [Validators.required]),
      'asunto': new FormControl('', [Validators.required, Validators.minLength(10)]),
      'observaciones': new FormControl(''),
    });
  }

  cargarDatosIniciales() {
    // Crear observables para las llamadas paralelas
    const destinosObs = this.codigoOrganizacion == '02'
      ? this.organizacionService.getEntregarCopere()
      : this.organizacionService.getWithCodigoCopere();

    const remitentesObs = this.organizacionService.getWithCodigoCopere();
    const clasesObs = this.claseService.findForMP();

    // Ejecutar todas las llamadas en paralelo
    forkJoin({
      destinos: destinosObs,
      remitentes: remitentesObs,
      clases: clasesObs
    }).subscribe({
      next: (responses: any) => {
        // Verificar que las respuestas tengan la estructura esperada
        this.destinos = responses.destinos?.data || [];
        this.remitentes = responses.remitentes?.data || [];
        this.clases = responses.clases?.data || [];

        // Reinicializar formulario con ID correcto
        this.initForm();
      },
      error: (err: any) => {
        console.error('Error cargando datos iniciales:', err);
        this.cargando = false;
        Swal.fire('AVISO', 'Error al cargar los datos iniciales', 'warning');
      }
    });
  }

  initForm() {
    // Actualizar el formulario con el ID correcto
    this.form.patchValue({
      id: this.correspondenciaId
    });

    // Si es edición, cargar los datos de la correspondencia
    if (this.correspondenciaId > 0) {
      this.getCorrespondencia();
    } else {
      this.cargando = false;
    }
  }

  getCorrespondencia() {
    this.correspondenciaService.listarPorId(this.correspondenciaId)
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.corresp = response.data;
            console.log('Datos cargados:', this.corresp);

            // Poblar el formulario con los datos obtenidos
            this.poblarFormulario();
          } else {
            console.warn('No se encontraron datos para la correspondencia');
            this.router.navigate(['/principal/list-correspondencia']);
          }
          this.cargando = false;
        },
        error: (err: any) => {
          console.error('Error cargando correspondencia:', err);
          this.cargando = false;
          Swal.fire('AVISO', 'Error al cargar los datos de la correspondencia', 'warning');
          this.router.navigate(['/principal/list-correspondencia']);
        }
      });
  }

  poblarFormulario() {
    if (this.corresp && this.form) {
      // Verificar que las propiedades existan antes de usarlas
      const fechaDocumento = this.corresp.fechaRegistro
        ? new Date(this.corresp.fechaRegistro)
        : null;

      // Actualizar los valores del formulario de forma segura
      this.form.patchValue({
        id: this.correspondenciaId,
        origen: this.corresp.origen.codigoInterno || '',
        destino: this.corresp.destino.codigoInterno || '',
        fechaDocumento: fechaDocumento,
        clase: this.corresp.clase.codigo || '',
        indicativo: this.corresp.nroSobre || '',
        folio: this.corresp.folio || '',
        asunto: this.corresp.asunto || '',
        observaciones: this.corresp.observaciones || ''
      });

      // Verificar si necesita mostrar campos adicionales
      if (this.corresp.origen === '6726') {
        this.mostrarPanelRemitenteExterno(this.corresp.origen);
      }
    }
  }

  mostrarPanelRemitenteExterno(event: any) {
    if (event == '6726') {
      this.mostrarTipoIdentidad = true;
    } else {
      this.mostrarTipoIdentidad = false;
    }
  }

  mostrarFormExterno(event: any) {
    if (event == '3')
      this.mostrarFormDatos = 3;
    else if (event == '0')
      this.mostrarFormDatos = 0;
    else if (event == '1' || event == '2')
      this.mostrarFormDatos = 2;
    else
      this.mostrarFormDatos = null;
  }

  operate() {
    if (!this.form.valid) {
      Swal.fire('Formulario inválido', 'Por favor complete todos los campos requeridos', 'warning');
      return;
    }

    // Verificar que corresp esté inicializado
    if (!this.corresp) {
      this.corresp = new CorrespondenciaOP();
    }

    this.corresp.origen = this.form.value['origen'];
    this.corresp.destino = this.form.value['destino'];
    this.corresp.fechaRegistro = this.form.value['fechaDocumento']; // FECHA DEL DOCUMENTO, NO ES FECHA DE REGISTRO EN EL SISTEMA
    this.corresp.clase = this.form.value['clase'];
    this.corresp.nroSobre = this.form.value['indicativo'];
    this.corresp.folio = this.form.value['folio'];
    this.corresp.asunto = this.form.value['asunto'];
    this.corresp.observaciones = this.form.value['observaciones'];
    this.corresp.organizacionRegistra = sessionStorage.getItem(environment.codigoOrganizacion);

    if (this.correspondenciaId > 0) {
      // Modo edición
      debugger
      this.corresp.fechaRegistro = environment.convertDateToStr(this.form.value['fechaDocumento']);
      this.correspondenciaService.updateCorrespondencia(this.correspondenciaId, this.corresp).subscribe({
        next: (response: any) => {
          Swal.fire('Actualización exitosa', response.message || 'Correspondencia actualizada correctamente', 'success');
          this.router.navigate(['/principal/list-correspondencia']);
        },
        error: (err: any) => {
          console.error('Error actualizando:', err);
          Swal.fire('Lo sentimos', 'Se presentó un inconveniente al actualizar', 'warning');
        }
      });
    } else {
      // Modo creación
      this.correspondenciaService.correspondenciaOP(this.corresp).subscribe({
        next: (response: any) => {
          if (response.httpStatus == 'CREATED') {
            this.form.reset();
            this.initFormBasic(); // Reinicializar formulario básico
            Swal.fire('Se registró correspondencia', response.message || 'Correspondencia creada correctamente', 'info');
          } else {
            Swal.fire('Lo sentimos', response.message || 'Error al crear', 'warning');
          }
        },
        error: (err: any) => {
          console.error('Error creando:', err);
          Swal.fire('Lo sentimos', 'Se presentó un inconveniente', 'warning');
        }
      });
    }
  }

  cancelar() {
    if (this.correspondenciaId > 0) {
      this.router.navigate(['/principal/list-correspondencia']);
    } else {
      this.form.reset();
      this.initFormBasic();
    }
  }

  // Getters seguros para el template
  get tituloFormulario(): string {
    return this.correspondenciaId > 0 ? 'EDITAR CORRESPONDENCIA' : 'REGISTRO DE CORRESPONDENCIA';
  }

  get textoBoton(): string {
    return this.correspondenciaId > 0 ? 'ACTUALIZAR' : 'REGISTRAR';
  }

  get esEdicion(): boolean {
    return this.correspondenciaId > 0;
  }
}
