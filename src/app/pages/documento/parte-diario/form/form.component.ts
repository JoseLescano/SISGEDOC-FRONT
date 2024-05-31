import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Anexo } from 'src/app/_model/anexo';
import { Documento } from 'src/app/_model/documento.model';
import { AnexoService } from 'src/app/_service/anexo.service';
import { DecretoService } from 'src/app/_service/decreto.service';
import { DocumentoRespuestaService } from 'src/app/_service/documento-respuesta.service';
import { DocumentoService } from 'src/app/_service/documento.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  documento:Documento;
  errorPDF : boolean = false;
  errorPDFReferencia : boolean = false;
  anexos:Anexo[]=[];
  selectedFiles: any;
  url_pdf : any;
  cargando : boolean = false;

  folders: any[] = [
    {
      name: 'Photos',
      updated: new Date('1/1/16'),
    },
    {
      name: 'Recipes',
      updated: new Date('1/17/16'),
    },
    {
      name: 'Work',
      updated: new Date('1/28/16'),
    },
  ];

  mostrarReferencia: boolean = false;
  mostrarDistribuir: boolean = false;
  organizacionLogueada: string = "";

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: Documento,
    private matDialog: MatDialogRef<FormComponent>,
    private documentoService:DocumentoService,
    private elRef: ElementRef,
    private documentoRespuestaService: DocumentoRespuestaService,
    private anexoService: AnexoService,
    private decretoService: DecretoService
  ) { }

  ngOnInit(): void {
    this.documento = {...this.data};
    this.organizacionLogueada = sessionStorage.getItem(environment.codigoOrganizacion);
    if (this.organizacionLogueada==this.documento.organizacionOrigen.codigoInterno){
      this.mostrarDistribuir=true;
    }else {
      this.mostrarDistribuir=false;
    }
    this.viewDocumento();
    if (this.documento.estadoDocumento.codigo!='15'){
      this.verReferencia();
      this.mostrarReferencia=true;
    }

    this.findAnexosByDocumento();
  }

  findAnexosByDocumento(){
    this.anexoService.findByDocumento(this.documento.codigo).subscribe((response:any)=> {
      this.anexos = response.data;
    }, error => {
      Swal.fire('LO SENTIMOS', `SE PRESENTO UN INCONVENIENTE EN CARGAR ANEXOS!`, 'warning');
    });
  }

  viewDocumento(){
    this.documentoService.viewPDF(this.documento.codigo).subscribe((response: any)=>{
      this.crearDocumento(response.data, 'documentoRespuesta');
      this.errorPDF = false;
    }, error => {
      this.errorPDF = true;
      Swal.fire('LO SENTIMOS', `SE PRESENTO UN INCONVENIENTE EN CARGAR PDF!`, 'warning');
    });
  }

  verReferencia(){
    this.documentoRespuestaService.viewPDF(this.documento.codigo, this.documento.organizacionDestino.codigoInterno)
    .subscribe((response:any)=> {
      this.crearDocumento(response.data, 'documentoReferencia');
      this.errorPDFReferencia = false;
    }, error => {
      this.errorPDFReferencia = true;
      Swal.fire('LO SENTIMOS', `SE PRESENTO UN INCONVENIENTE EN CARGAR REFERENCIA PDF!`, 'warning');
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
    // this.convertirArchivoABase64(this.selectedFiles.item(0));
  }


  convertirArchivoABase64(file: File) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const base64 = reader.result as string;
    };
    reader.onerror = error => {
        console.log('Error: ', error);
    };
  }

  descargarAnexo(anexo:Anexo){
    this.anexoService.descargarAnexo(anexo).subscribe((resp: any) => {
        if (resp == null){
            Swal.fire('Lo sentimos', `Archivo no disponible y/o no se encuentra`, 'error');
        } else {

          let extension=anexo.url.split('.').pop();
          extension=extension.toUpperCase();

          if(extension=="PDF" ){
            this.downloadPDF(resp[0]);
          }

          if(extension=="DOC" || extension=="DOCX"){
            this.downloadWord(resp[0]);
          }

          if(extension=="XLSX" ||  extension=="XLS"){
            this.downloadExcel(resp[0]);
          }

          if(extension=="PPT" ||  extension=="PPTX"){
            this.downloadPPT(resp[0]);
          }

          if(extension=="RAR" || extension=="rar" ||  extension=="ZIP"){
            this.downloadRar(resp[0]);
          }
        }
    }, error => {
      Swal.fire('LO SENTIMOS', `SE PRESENTO UN INCONVENIENTE EN DESCARGAR ANEXO!`, 'warning');
    });
  }

  downloadPDF(pdf: any) {
    const linkSource = `data:application/pdf;base64,${pdf}`;
    const downloadLink = document.createElement('a');
    const fileName = this.generarNombreArchivo()+'.pdf';
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }
  downloadPPT(ppt: any) {
    const linkSource = `data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,${ppt}`;
    const downloadLink = document.createElement('a');
    const fileName = this.generarNombreArchivo()+'.pptx';
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }

  downloadExcel(excel: any) {
    const linkSource = `data:application/vnd.ms-excel;base64,${excel}`;
    const downloadLink = document.createElement('a');
    const fileName = this.generarNombreArchivo()+'.xlsx';
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }

  generarNombreArchivo() :any{
    const timestamp = new Date().getTime(); // Marca de tiempo actual
    const randomValue = Math.floor(Math.random() * 1000); // Valor aleatorio entre 0 y 999
    const nombreArchivo = `archivo_${timestamp}_${randomValue}`; // Formato del nombre del archivo
    return nombreArchivo;
  }

  downloadRar(rar: any) {

    const byteCharacters = atob(rar);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob:any = new Blob([byteArray], { type: 'application/x-rar-compressed' });

    // Crear un enlace temporal y descargar el archivo
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download =  this.generarNombreArchivo()+'.rar';

    // Simular un clic en el enlace para descargar el archivo
    link.click();
  }


  downloadWord(word: any) {


    const linkSource = `data:application/msword;base64,${word}`;
     const downloadLink = document.createElement('a');
     const fileName = this.generarNombreArchivo()+'.docx';
     downloadLink.href = linkSource;
     downloadLink.download = fileName;
     downloadLink.click();
  }

  close(){
    this.matDialog.close();
  }

  elevarDocumento(){
    this.decretoService.elevarDocumento(this.documento.codigo, sessionStorage.getItem(environment.codigoOrganizacion))
    .subscribe((response:any)=> {
      if (response.httpStatus=='CREATED'){
        Swal.fire('DOCUMENTO ELEVADO', response.message, 'info');
      }else {
        Swal.fire('LO SENTIMOS', response.message, 'warning');
      }
    }, error=> {
      Swal.fire('LO SENTIMOS', 'SE PRESENTO UN INCONVIENTE EN LA ELEVACION DEL DOCUMENTO', 'warning');
    });
  }

  distribuir(){
    Swal.fire({
      title: "¿Desea agregar una firma digital?",
      text: "Antes de realizar la operación desea firmar digitalmente el documento",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, deseo firmarlo",
      cancelButtonText: `Solo DISTRIBUIR`
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("Saved!", "", "success");
      } else {
        this.cargando = true;
        this.firmarDocumento();
        this.cargando = false;
        // this.decretoService.distrubirDocumento(this.documento.codigo, sessionStorage.getItem(environment.codigoOrganizacion)).subscribe;
        Swal.fire("Changes are not saved", "", "info");
      }
    });
  }

  _window(): any {
    // return the global native browser window object
    return window;
  }

  firmarDocumento(){

    this.documentoService.firmarDocumento(this.selectedFiles[0]).subscribe((response:any)=>{
       this._window().iniciarFirma(response[1]);
    });

  }


}
