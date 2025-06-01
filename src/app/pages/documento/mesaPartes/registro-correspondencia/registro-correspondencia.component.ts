import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CorrespondenciaOP } from 'src/app/_DTO/CorrespondenciaOP';
import { Clase } from 'src/app/_model/clase';
import { Correspondencia } from 'src/app/_model/correspondencia';
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

  remitentes:Organizacion[] = [];
  destinos:Organizacion[] = [];
  clases:Clase[];
  cargando : boolean = false;
  mostrarTipoIdentidad : boolean = false;
  mostrarFormDatos: number;
  corresp: CorrespondenciaOP = new CorrespondenciaOP();

  codigoOrganizacion : any = sessionStorage.getItem(environment.codigoOrganizacion);

  tipoDocumento: any = [
    { codigo: '0', nombre: 'RUC' },
    { codigo: '1', nombre: 'DNI' },
    { codigo: '2', nombre: 'CARNET EXTRANJERIA' },
    { codigo: '3', nombre: 'SIN DOCUMENTO' },
  ];

  form:FormGroup;

  constructor(
    private organizacionService: OrganizacionService,
    private claseService: ClaseService,
    private correspondenciaService: CorrespondenciaService,
    private router : Router
  ) { }

  ngOnInit(): void {
    if (this.codigoOrganizacion == '120210' ||  this.codigoOrganizacion == '12021001' || this.codigoOrganizacion == '12021002' || this.codigoOrganizacion == '02'){
      this.cargando= true;
      debugger
      if (this.codigoOrganizacion == '02'){
        this.organizacionService.getEntregarCopere()
          .subscribe(
            {
              next:(response:any)=> {
                debugger
                this.destinos = response.data;
              }
            }
          );
      }else {
        this.organizacionService.getWithCodigoCopere()
        .subscribe(
          {
            next:(response:any)=> {
              debugger
              this.destinos = response.data;
            }
          }
        );
      }


      this.organizacionService.getWithCodigoCopere()
      .subscribe((response:any)=>{
        this.remitentes = response.data;
      });
      this.claseService.listar().subscribe((response:any)=> this.clases = response.data );
      this.initForm();
      this.cargando= false;
    } else {
      this.router.navigate(['/principal/dashboard']);
      Swal.fire('LO SENTIMOS', 'USTED NO CUENTA CON LOS PERMISOS CORRESPONDIENTES', 'info');
    }
  }

  initForm(){
    this.form = new FormGroup({
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

  mostrarPanelRemitenteExterno(event:any){
    if (event=='6726')
      this.mostrarTipoIdentidad = true;
    else this.mostrarTipoIdentidad = false;
  }

  mostrarFormExterno(event:any){
    if (event == '3')
      this.mostrarFormDatos = 3;
    else if (event == '0')
      this.mostrarFormDatos = 0;
    else if (event == '1'|| event == '2')
      this.mostrarFormDatos = 2;

  }

  operate(){
    this.corresp.origen = this.form.value['origen'];
    this.corresp.destino = this.form.value['destino'];
    this.corresp.fechaRegistro = this.form.value['fechaDocumento'];
    this.corresp.clase = this.form.value['clase'];
    this.corresp.nroSobre = this.form.value['indicativo'];
    this.corresp.folio = this.form.value['folio'];
    this.corresp.asunto = this.form.value['asunto'];
    this.corresp.observaciones = this.form.value['observaciones'];
    this.corresp.organizacionRegistra = sessionStorage.getItem(environment.codigoOrganizacion);
    this.correspondenciaService.correspondenciaOP(this.corresp).subscribe( {
      next: (response:any)=> {
        if (response.httpStatus =='CREATED'){
          this.form.reset();
          Swal.fire('Se registro correspondencia', response.message, 'info');
        } else
          Swal.fire('Lo sentimos', response.message, 'warning');
        },
      error: (err: any) => {
          Swal.fire('Lo sentimos', 'Se presento un inconveniente', 'warning');
      }
    });

  }

  cancelar(){
    this.form.reset();
  }

}
