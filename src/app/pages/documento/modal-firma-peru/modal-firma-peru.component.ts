import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DocumentoService } from 'src/app/_service/documento.service';

@Component({
  selector: 'app-modal-firma-peru',
  templateUrl: './modal-firma-peru.component.html',
  styleUrls: ['./modal-firma-peru.component.css']
})
export class ModalFirmaPeruComponent implements OnInit, AfterViewInit  {

  errorPDF: boolean = false;
  documento: any = '';
  url_pdf : any = '';
  @ViewChild('embeddedPage') iframe: ElementRef<HTMLIFrameElement>;

  constructor(
    public dialogRef: MatDialogRef<ModalFirmaPeruComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private elRef: ElementRef,
    private documentoService:DocumentoService
  ) { }

  ngOnInit(): void {
    this.documento = this.data.documento;
  }

  ngAfterViewInit(): void {
    this.crearDocumento(this.documento);
  }

  close(){
    this.dialogRef.close();
  }

  crearDocumento(base64: string) {
    const byteArray = this.base64ToUint8Array(base64.split(',')[1]); // Split to remove the data URL prefix
    const file = new Blob([byteArray], { type: 'application/pdf' });
    const fileURL = URL.createObjectURL(file);
    if (this.iframe && this.iframe.nativeElement) {
      this.iframe.nativeElement.src = fileURL;
    } else {
      console.error('El iframe no se ha encontrado en el DOM');
    }
  }


  base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }


  // firmarDocumento(){
  //   this.documentoService.firmarDocumento();
  // }

}
