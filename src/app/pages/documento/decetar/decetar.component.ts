import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DecretoAccionDTO } from 'src/app/_DTO/DecretoAccionDTO';
import { DecretoDTO } from 'src/app/_DTO/DecretoDTO';
import { DecretoDocumentoDTO } from 'src/app/_DTO/DecretoDocumentoDTO';
import { Accion } from 'src/app/_model/accion';
import { Decreto } from 'src/app/_model/decreto';
import { Organizacion } from 'src/app/_model/organizacion';
import { Prioridad } from 'src/app/_model/prioridad';
import { AccionService } from 'src/app/_service/accion.service';
import { DecretoService } from 'src/app/_service/decreto.service';
import { DocumentoService } from 'src/app/_service/documento.service';
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

  destinos:Organizacion[] = [];
  prioridades: Prioridad[] = [];
  idDocumento: number;
  menus:any[]=[];
  acciones:Accion[] =  [];
  cargando : boolean = false;
  codigoDecreto: any;

  formParent : FormGroup = new FormGroup({});
  origen : Organizacion = new Organizacion();

  constructor(
    private accionService: AccionService,
    private organizacionService: OrganizacionService,
    private prioridadService:PrioridadService,
    private documentoService: DocumentoService,
    private decretoService: DecretoService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.cargando = true;
    this.organizacionService.getChildrenByCodigo(sessionStorage.getItem(environment.codigoOrganizacion)).subscribe((response:any)=> {
      this.destinos = response.data;
      if (this.destinos.length==0){
        this.router.navigate(['./principal/pendientes']);
        Swal.fire('LO SENTIMOS', `SE VALIDA QUE NO TIENE ORGANIZACIONES A SU MANDO!`, 'warning');
      }
    });
    this.accionService.listar().subscribe((response:any)=> {
      this.acciones = response.data;
    });
    this.prioridadService.listar().subscribe((response:any)=> {
      this.prioridades = response;
    });

    this.getIdDocumento();
    this.initFormParent();
    this.cargando =false;
  }

  getIdDocumento(): void {
    const id = +this.route.snapshot.paramMap.get('codigoDocumento');
    this.codigoDecreto = this.route.snapshot.paramMap.get('idDecreto');
    this.idDocumento = id;
  }

  initFormParent(){
    this.origen.codigoInterno  = sessionStorage.getItem(environment.codigoOrganizacion);
    this.formParent = new FormGroup(
      {
        codigoDocumento: new FormControl(this.idDocumento, [Validators.required]),
        origen: new FormControl(this.origen, [Validators.required]),
        decretos: new FormArray([], [Validators.required])
      });
      this.addDecreto();
  }

  initAcciones(): FormArray {
    const accionesArray = new FormArray([]);
    this.acciones.forEach(() => {
      accionesArray.push(new FormControl(false)); // Agregar control deseleccionado (false) por defecto
    });
    return accionesArray;
  }
  idItemAdd:number=0;
  initFormDecreto(): FormGroup{
    let formControl : FormControl = new FormControl;
    this.idItemAdd++;
    return new FormGroup(
      {
        destino: new FormControl('', [Validators.required]),
        prioridad: new FormControl('', [Validators.required]),
        fechaLimite: new FormControl('', [Validators.required]),
        acciones: new FormControl([]),
        observaciones: new FormControl(''),
        idGroup:new FormControl(this.idItemAdd),
      }
    );
  }

  addDecreto(): void {
    const refDecreto = this.formParent.get('decretos') as FormArray;
    refDecreto.push(this.initFormDecreto());
  }

  getCrl(key:string, form: FormGroup):any{
    return form.get(key);
  }

  getDecreto(key:string, decetro: FormArray):any{
    return decetro.get(key);
  }


  remove(rowIndex:any){
    const refDecreto = this.formParent.get('decretos') as FormArray;
    refDecreto.removeAt(rowIndex);
  }

  decretoDocumento: DecretoDocumentoDTO = new DecretoDocumentoDTO();
  decretos : DecretoDTO[] = [];

  getValueCheckBox(idGroup: any):string[]{
    var checkboxes: any = document.getElementsByName(
      "group"+idGroup
    );
    var numberOfCheckedItems = 0;
    let lista: string[] = [];
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        lista.push(checkboxes[i].value);
      }
    }
    return lista;
  }

  operate(){
    this.cargando = true;
    let formDecretos = this.formParent.value['decretos'];
    for (let index = 0; index < formDecretos.length; index++) {
      let dd : DecretoDTO= new DecretoDTO();
      // dd.documento = this.formParent.value['codigoDocumento'];
      dd.origen = this.formParent.value['origen'];
      dd.destino = formDecretos[index].destino;
      dd.fechaLimite = environment.convertDateToStr(formDecretos[index].fechaLimite);
      dd.observacion = formDecretos[index].observaciones;
      dd.prioridad = formDecretos[index].prioridad;

      let acciones = this.getValueCheckBox(formDecretos[index].idGroup);
      let decretosAcciones: DecretoAccionDTO[] = [];
      for (let y = 0; y < acciones.length; y++) {
        let da: DecretoAccionDTO = new DecretoAccionDTO();
        da.accion = acciones[y];
        decretosAcciones.push(da);
      }
      dd.acciones = decretosAcciones;
      this.decretos.push(dd);
    }
    this.decretoDocumento.codigoDocumento = this.formParent.value['codigoDocumento'];
    this.decretoDocumento.decretoActual = this.codigoDecreto;
    this.decretoDocumento.decretos = this.decretos;
    debugger;
    this.decretoService.decretarDocumento(this.decretoDocumento).subscribe((response:any)=> {
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


  }

  onCheckboxChange(item: any, index:any) {
    // debugger;
    // let selectDecreto = (this.formParent.controls['decretos'] as FormArray);
    // let selectFormAccion = (selectDecreto.controls[index] as FormArray);
    // let accion =  selectFormAccion.controls['acciones'] as FormArray;
    // console.log(item)
    // let arrayAccion = Object.assign([], accion);
    // arrayAccion.append(item);
    // accion.setValue(arrayAccion);

    // if (event.target.checked) {
    //   selectAccion.push(new FormControl(event.target.value));
    // } else {
    //   const index = selectAccion.controls.findIndex(x =>
    //     x.value === event.target.value
    //   );
    //   selectAccion.removeAt(index);
    // }
  }

}
