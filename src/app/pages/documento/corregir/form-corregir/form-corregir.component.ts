import { CorrecionService } from './../../../../_service/correcion.service';
import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { CorrecionDTO } from 'src/app/_DTO/CorrecionDTO';
import { Documento } from 'src/app/_model/documento.model';
import { DocumentoRespuestaService } from 'src/app/_service/documento-respuesta.service';
import { DocumentoService } from 'src/app/_service/documento.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-form-corregir',
  templateUrl: './form-corregir.component.html',
  styleUrls: ['./form-corregir.component.css']
})
export class FormCorregirComponent implements OnInit {

  url_pdf: any;
  vidDocumento:any;
  observaciones : any = '';
  selectedFiles: any;
  errorPDF : boolean = false;
  correciones: CorrecionDTO[] = [];
  cambioPDF : boolean = false;
  cargando : boolean = false;

  constructor(
    private documentoService:DocumentoService,
    private route: ActivatedRoute,
    private elRef: ElementRef,
    private router: Router,
    private correcionService: CorrecionService,
    private respuesta : DocumentoRespuestaService,
    @Inject(MAT_DIALOG_DATA) private data:any,
    private matDialog: MatDialogRef<FormCorregirComponent>,) {

    }

  ngOnInit(): void {
    this.getIdDocumento();
  }

  getIdDocumento(): void {
    this.vidDocumento = this.data.documento;
    let decreto = this.data.decreto;
    this.viewDocumento(decreto);
    this.correcionService.findByDecreto(this.data.decreto).subscribe((response:any)=> {
      this.correciones = response;
    })
  }

  viewDocumento(decreto: any){
    this.respuesta.viewPDFByDecreto(decreto).subscribe((response: any)=>{
      this.crearDocumento(response.data, 'embeddedPage');
      this.errorPDF = false;
    }, error => {
      this.errorPDF = true;
      Swal.fire('LO SENTIMOS', `SE PRESENTO UN INCONVENIENTE EN CARGAR PDF!`, 'warning');
    });
  }

  crearDocumento(resp: any, iframeId: string) {
    const byteArray = new Uint8Array(atob(resp[0]).split('').map((char) => char.charCodeAt(0)));
    const file = new Blob([byteArray], { type: 'application/pdf' });
    const fileURL = URL.createObjectURL(file);
    const iframe: any = document.getElementById(iframeId) as HTMLIFrameElement;
    iframe.contentWindow.location.replace(fileURL);
    var rf_file = new File([file], URL.createObjectURL(file), { type: 'application/pdf'});
    let listFile = [rf_file];
    let list = new DataTransfer();
    list.items.add(rf_file);
    this.selectedFiles=list.files;
    this.url_pdf = this.selectedFiles[0].name;

  }

  corregirDocumento(){
    if ((this.observaciones != '' && this.observaciones != null) && this.selectedFiles !=null){
      this.respuesta.corregirDocumento(this.data.decreto, this.selectedFiles[0],
        this.observaciones).pipe(switchMap((response: any)=>{
          if (response.httpStatus=='CREATED'){
            Swal.fire('ACCION REALIZADA', response.message, 'info');
          }else {
            Swal.fire('LO SENTIMOS', response.message, 'info');
          }
          return this.documentoService.findForCorregir(sessionStorage.getItem(environment.codigoOrganizacion));
      })).subscribe((data: any) => {
        this.documentoService.setDocumentoCambio(data);
        this.close();
      });
    }else {
      Swal.fire('Lo sentimos!', `Debe de ingresar una observación y/o adjuntar documento para continuar con el registro`, 'info');
    }

  }

  seleccionarDocumento(event: any): void {
    this.cambioPDF = true;
    this.selectedFiles = null;
    const fileTemp = event.target.files[0];
    const fileType = fileTemp.type;
    if (fileType !== 'application/pdf' && fileType !== 'application/msword'
        && fileType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        event.target.value = ''; // Borra la selección del archivo
        this.selectedFiles=null;
        Swal.fire('Lo sentimos', `Debe de seleccionar un documento PDF ó WORD`, 'info');
    } else{
        if(event.target.files.length>0){
          this.selectedFiles = event.target.files;
          this.url_pdf = this.selectedFiles[0].name;
          if (this.selectedFiles[0].type == 'application/pdf') {
            this.fileInIframe(this.selectedFiles[0], 'embeddedPage');
            this.cargando = false;
          }else {
            this.cargando = true;
            this.documentoService
            .convertFileToPDF(this.selectedFiles.item(0))
            .subscribe((resp: any) => {
              this.crearDocumento(resp, 'embeddedPage');
              this.cargando = false;
            }, error => {
              this.cargando = false;
              Swal.fire('Lo sentimos', 'Se presento un inconveniente al convertir Word a PDF', 'info');
            });
          }
        }
      }
  }

  updateDocumento(){
    this.documentoService
      .convertFileToPDF(this.selectedFiles.item(0))
      .subscribe((resp: any) => {
        let byteArray = new Uint8Array(atob(resp[0]).split('').map((char) => char.charCodeAt(0)));
        let file = new Blob([byteArray], { type: 'application/pdf' });
        var rf_file = new File([file], URL.createObjectURL(file), {
          type: 'application/pdf',
        });
        let list = new DataTransfer();
        list.items.add(rf_file);
        this.selectedFiles = list.files;
        this.url_pdf = this.selectedFiles[0].name;
        this.cargando = false;
        this.convertirArchivoABase64(this.selectedFiles.item(0));
        this.cambioPDF = true;
      }, error => {
        this.cargando = false;
        Swal.fire('Lo sentimos', 'Se presento un inconveniente al convertir Word a PDF', 'info');
      });
  }

  fileInIframe(file:any,idFrame:any){
    let fileURL = URL.createObjectURL(file);
    this.url_pdf = fileURL;
    let iframe: any = document.getElementById(''+idFrame) as HTMLIFrameElement;
    iframe.contentWindow.location.replace(fileURL);
  }

  convertirArchivoABase64(file: File) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const base64 = reader.result as string;
    };
    reader.onerror = error => {
        // console.log('Error: ', error);
    };
  }

  close(){
    this.matDialog.close();
  }

}
