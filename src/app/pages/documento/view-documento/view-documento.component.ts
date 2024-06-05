import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Documento } from 'src/app/_model/documento.model';
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

  constructor(@Inject(MAT_DIALOG_DATA) private data:Documento,
              private matDialog: MatDialogRef<ViewDocumentoComponent>,
            private documentoService:DocumentoService,
            private elRef: ElementRef,) { }

  ngOnInit(): void {
    this.getIdDocumento();
  }

  close(){
    this.matDialog.close();
  }

  getIdDocumento(): void {
    this.vidDocumento = this.data.codigo;
    this.viewDocumento(this.vidDocumento);
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

}
