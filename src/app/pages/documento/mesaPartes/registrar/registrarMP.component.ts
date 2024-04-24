import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DocumentoArchivoAnexo } from 'src/app/_DTO/DocumentoArchivoAnexo';
import { Clase } from 'src/app/_model/clase';
import { Documento } from 'src/app/_model/documento.model';
import { Organizacion } from 'src/app/_model/organizacion';
import { ClaseService } from 'src/app/_service/clase.service';
import { DocumentoService } from 'src/app/_service/documento.service';
import { OrganizacionService } from 'src/app/_service/organizacion.service';
import { PrioridadService } from 'src/app/_service/prioridad.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

import {BreakpointObserver} from '@angular/cdk/layout';
import {StepperOrientation} from '@angular/material/stepper';
import {Observable, map} from 'rxjs';


@Component({
  selector: 'app-registrarMP',
  templateUrl: './registrarMP.component.html',
  styleUrls: ['./registrarMP.component.css']
})
export class RegistrarMPComponent implements OnInit {

  listaTipoOrganizacion : any = [
    {
      nombre: "INTERNA",
      codigo: "I"
    },
    {
      nombre: "EXTERNA",
      codigo: "E"
    }
  ];

  stepperOrientation: Observable<StepperOrientation>;
  firstFormGroup : FormGroup;
  secondFormGroup : FormGroup;
  form:FormGroup;

  remitentes:Organizacion[] = [];
  clases:Clase[];
  prioridades : any;
  selectedFiles: any = null;
  url_pdf = '';
  archivoPDF: any;
  documento:Documento = new Documento();
  organizacionesDestino:Organizacion[];
  copiasInformativas:Organizacion[];
  documentoar : DocumentoArchivoAnexo = new DocumentoArchivoAnexo();

  // =========================================================================================

  constructor(private organizacionService: OrganizacionService,
            private claseService: ClaseService,
            private prioridadService: PrioridadService,
            private documentoService:DocumentoService,
            private router: Router,
            private formBuilder: FormBuilder
  ) {

   }

  ngOnInit(): void {
    this.initForm();
    this.organizacionService.getRemitentesInterno().subscribe((response:any)=>{
      this.remitentes = response.data;
    });
    this.claseService.listar().subscribe((response:any)=> this.clases = response.data );
    this.prioridadService.listar().subscribe(data=> this.prioridades = data);
    this.organizacionService.getChildrenByCodigo(environment.codigoOrganizacion).subscribe((response:any)=> {
      this.organizacionesDestino = response.data;
      this.copiasInformativas = response.data;
    });
  }

  initForm(){
    this.firstFormGroup = this.formBuilder.group({
      'tipoOrganizacion':  new FormControl('', [Validators.required]),
      'organizacionRemitente':  new FormControl('', [Validators.required]),
      'tipoDocumento':  new FormControl('', [Validators.required]),
      'nroDocumento':  new FormControl('', [Validators.required]),
      'indicativo':  new FormControl('', [Validators.required]),
      'remitente':  new FormControl('', [Validators.required]),
      'prioridad':  new FormControl('', [Validators.required]),
      'fechaDocumento':  new FormControl('', [Validators.required]),
      'folio':  new FormControl('', [Validators.required]),
      'asunto':  new FormControl('', [Validators.required]),

    });
    this.secondFormGroup = this.formBuilder.group({
      'anexos': new FormControl(''),
      'destinos': new FormControl(''),
      'copiasInformativas': new FormControl(''),
    });
  }


  getOrganizaciones(tipo:any){
    debugger;
    let tipoOrganizaciones  = this.firstFormGroup.get('tipoOrganizacion').value;
    this.remitentes = [];
    if (tipoOrganizaciones == 'E'){
      this.organizacionService.getAllExternas().subscribe((response:any)=>{
        this.remitentes = response.data;
      });
    } else {
      this.organizacionService.getRemitentesInterno().subscribe((response:any)=>{
        this.remitentes = response.data;
      });
    }


  }

  operate(){

    if (this.form.valid){
      this.documentoar.tipoOrganizacion = this.form.value['tipoOrganizacion'];
      this.documentoar.organizacionOrigen = this.form.value['organizacionRemitente'];
      this.documentoar.clase = this.form.value['tipoDocumento'];
      this.documentoar.nroOrden =  this.form.value['nroDocumento'];
      this.documentoar.indicativo =  this.form.value['indicativo'];
      this.documentoar.claveIndicativo= this.form.value['remitente'];
      this.documentoar.prioridad = this.form.value['prioridad'];
      this.documentoar.fechaDocumento= this.form.value['fechaDocumento'];
      this.documentoar.folio = this.form.value['folio'];
      this.documentoar.asunto= this.form.value['asunto'];
      this.documentoar.destinos = this.form.value['destinos'];
      this.documentoar.archivoPrincipal = this.selectedFiles.item(0);
      this.documentoService.recibirDocumentoMP(this.documentoar).subscribe((response:any) =>{
         if (response.httpStatus=='CREATED'){
          this.initForm();
          Swal.fire(`Se ha registrado documento`, response.message, 'info');
          this.router.navigate(['/recibir-documento']);
         }
      }, error => {
        Swal.fire('Lo sentimos', `No se ha registrado documento`, 'info');
      });

    } else {
      Swal.fire('Lo sentimos', `Se presento un inconveniente!`, 'warning');
    }


  }

  get nativeDocument(): any {
    return document;
  }

  agregarArchivo() {
    this.nativeDocument.getElementById('btnFileUpload213').click();
  }

  fileInIframe(file:any,idFrame:any){
    let fileURL = URL.createObjectURL(file);
    this.url_pdf = fileURL;
    let iframe: any = document.getElementById(''+idFrame) as HTMLIFrameElement;
    iframe.contentWindow.location.replace(fileURL);
  }

  selectArchivoPrincipal(event: any): void {

    const fileTemp = event.target.files[0];
      const fileType = fileTemp.type;
      if (fileType !== 'application/pdf') {
        event.target.value = ''; // Borra la selección del archivo
        this.selectedFiles=null;
        Swal.fire('Lo sentimos', `Se presento un inconveniente en la consulta`, 'warning');
      }else{
        if(event.target.files.length>0){
          this.selectedFiles = event.target.files;
          this.url_pdf = this.selectedFiles[0].name;
          this.selectedFiles = event.target.files;
          environment.cantidadPaginasPDF(this.selectedFiles[0],
            (cpages:any)=>{
              this.form.controls['folio'].setValue(cpages);
              //this.form.controls['archivoPDF'].setValue(this.selectedFiles.item(0));
            }
          );

          this.fileInIframe(this.selectedFiles[0],"documentoPrincipal");
          let byteArray = new Uint8Array(
            atob(this.selectedFiles[0])
              .split('')
              .map((char) => char.charCodeAt(0))
          );
          let file = new Blob([byteArray], { type: 'application/pdf' });
            var rf_file = new File([file], URL.createObjectURL(file), {
              type: 'application/pdf',
            });
          let list = new DataTransfer();
          list.items.add(rf_file);
          this.selectedFiles = list.files;
        }
      }
    }

}
