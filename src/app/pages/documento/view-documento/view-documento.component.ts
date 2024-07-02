import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Anexo } from 'src/app/_model/anexo';
import { Documento } from 'src/app/_model/documento.model';
import { AnexoService } from 'src/app/_service/anexo.service';
import { DocumentoService } from 'src/app/_service/documento.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-documento',
  templateUrl: './view-documento.component.html',
  styleUrls: ['./view-documento.component.css']
})
export class ViewDocumentoComponent implements OnInit {

  errorPDF: boolean = false;
  vidDocumento: any = '';
  url_pdf : any = '';
  anexos: Anexo[]= [];

  constructor(
    @Inject(MAT_DIALOG_DATA) private data:Documento,
    private matDialog: MatDialogRef<ViewDocumentoComponent>,
    private documentoService:DocumentoService,
    private elRef: ElementRef,
    private anexoService: AnexoService) { }

  ngOnInit(): void {
    this.getIdDocumento();
  }

  close(){
    this.matDialog.close();
  }

  getIdDocumento(): void {
    this.vidDocumento = this.data.codigo;
    this.viewDocumento(this.vidDocumento);
    this.viewAnexos(this.vidDocumento);
  }

  viewDocumento(vidDocumento: any){
    this.documentoService.viewPDF(vidDocumento).subscribe((response: any)=>{
      this.crearDocumento(response.data);
      this.errorPDF = false;
    }, error => {
      this.close();
      Swal.fire('LO SENTIMOS', `SE PRESENTO UN INCONVENIENTE EN CARGAR PDF!`, 'warning');
    });
  }

  crearDocumento(resp: any){
    let byteArray = new Uint8Array(
      atob(resp[0])
        .split('')
        .map((char) => char.charCodeAt(0))
    );
    let file = new Blob([byteArray], { type: 'application/pdf' });
    let fileURL = URL.createObjectURL(file);
    this.url_pdf = fileURL;
    let iframe:any = this.elRef.nativeElement.querySelector('iframe')as HTMLIFrameElement;
    iframe.contentWindow.location.replace(fileURL);

  }

  viewAnexos(vidDocumento: any){
    this.anexoService.findByDocumento(vidDocumento).subscribe({
      next: (response:any)=> {
        debugger;
        this.anexos = response.data;
      }, error: (err) => {
        Swal.fire('LO SENTIMOS', 'SE PRESENTO UN INCONVENIENTE EN CARGAR LOS ANEXOS', 'warning');
      }
    })
  }

  descargarAnexo(anexo:Anexo){
    debugger;
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


}
