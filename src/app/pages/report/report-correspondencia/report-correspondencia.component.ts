import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DocumentoService } from 'src/app/_service/documento.service';
import Swal from 'sweetalert2';
import { ViewDocumentoComponent } from '../../documento/view-documento/view-documento.component';
import { CorrespondenciaService } from 'src/app/_service/correspondencia.service';

@Component({
  selector: 'app-report-correspondencia',
  templateUrl: './report-correspondencia.component.html',
  styleUrls: ['./report-correspondencia.component.css']
})
export class ReportCorrespondenciaComponent implements OnInit {

  vidDocumento: any = '';
  url_pdf : any = '';

  constructor(@Inject(MAT_DIALOG_DATA) private data:any,
  private matDialog: MatDialogRef<ViewDocumentoComponent>,
  private correspondenciaService:CorrespondenciaService,
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
    this.correspondenciaService.reportCorrespondencia(vidDocumento).subscribe((response: any)=>{
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
