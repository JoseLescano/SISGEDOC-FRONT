import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DocumentoService } from 'src/app/_service/documento.service';
import Swal from 'sweetalert2';
import { ViewDocumentoComponent } from '../../documento/view-documento/view-documento.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-reporte-documento-decretado',
  templateUrl: './reporte-documento-decretado.component.html',
  styleUrls: ['./reporte-documento-decretado.component.css']
})
export class ReporteDocumentoDecretoComponent implements OnInit {

  vidDocumento: any = '';
  url_pdf : any = '';


  constructor(
    @Inject(MAT_DIALOG_DATA) private data:any,
    private matDialog: MatDialogRef<ViewDocumentoComponent>,
    private documentoService:DocumentoService,
    private elRef: ElementRef) { }

  ngOnInit(): void {
    this.getIdDocumento();
  }

  close(){
    this.matDialog.close();
  }

  getIdDocumento(): void {
    this.vidDocumento = this.data;
    this.viewDocumento(this.vidDocumento);
  }


  viewDocumento(vidDocumento: any){
    debugger;
    this.documentoService.reportDecretados(this.data.codigoOrganizacion,
    this.data.fechaInicio,
    this.data.fechaFin
  ).subscribe((response: any)=>{
      debugger;
      this.crearDocumento(response);
    }, error => {
      this.close();
      Swal.fire('LO SENTIMOS', `SE PRESENTO UN INCONVENIENTE EN CARGAR PDF!`, 'warning');
    });
  }

  crearDocumento(resp: any){
    debugger;
    let byteArray = new Uint8Array(
      atob(resp[0])
        .split('')
        .map((char) => char.charCodeAt(0))
    );
    let file = new Blob([byteArray], { type: 'application/pdf' });
    let fileURL = URL.createObjectURL(file);
    this.url_pdf = fileURL;
    debugger;
    let iframe:any = this.elRef.nativeElement.querySelector('iframe')as HTMLIFrameElement;
    iframe.contentWindow.location.replace(fileURL);

  }
}
