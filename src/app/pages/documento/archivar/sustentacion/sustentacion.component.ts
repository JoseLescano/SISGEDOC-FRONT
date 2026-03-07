import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Decreto } from 'src/app/_model/decreto';
import { Documento } from 'src/app/_model/documento.model';
import { ArchivoService } from 'src/app/_service/archivo.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sustentacion',
  templateUrl: './sustentacion.component.html',
  styleUrls: ['./sustentacion.component.css']
})
export class SustentacionComponent implements OnInit {

  errorPDF: boolean = false;
  vidDecreto: any = '';
  url_pdf: any = '';

  constructor(@Inject(MAT_DIALOG_DATA) private data: Decreto,
    private matDialog: MatDialogRef<SustentacionComponent>,
    private archivoService: ArchivoService,
    private elRef: ElementRef,) { }

  ngOnInit(): void {
    this.getIdDocumento();
  }

  close() {
    this.matDialog.close();
  }

  getIdDocumento(): void {
    this.vidDecreto = this.data;
    this.viewDocumento(this.vidDecreto);
  }

  viewDocumento(vidDocumento: any) {
    this.archivoService.viewPDF(vidDocumento).subscribe((response: any) => {
      if (response && response.data) {
        this.crearDocumento(response.data);
      } else {
        this.errorPDF = true;
      }
      this.errorPDF = false;
    }, error => {
      this.close();
      Swal.fire('LO SENTIMOS', `SE PRESENTO UN INCONVENIENTE EN CARGAR PDF!`, 'warning');
    });
  }

  crearDocumento(resp: any) {
    if (!resp || resp.length === 0) return;
    let byteArray = new Uint8Array(
      atob(resp[0])
        .split('')
        .map((char) => char.charCodeAt(0))
    );
    let file = new Blob([byteArray], { type: 'application/pdf' });
    let fileURL = URL.createObjectURL(file);
    this.url_pdf = fileURL;
    let iframe: any = this.elRef.nativeElement.querySelector('iframe') as HTMLIFrameElement;
    iframe.contentWindow.location.replace(fileURL);

  }

}
