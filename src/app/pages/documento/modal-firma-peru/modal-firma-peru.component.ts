import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-firma-peru',
  templateUrl: './modal-firma-peru.component.html',
  styleUrls: ['./modal-firma-peru.component.css']
})
export class ModalFirmaPeruComponent implements OnInit {

  errorPDF: boolean = false;
  documento: any = '';
  url_pdf : any = '';

  constructor(public dialogRef: MatDialogRef<ModalFirmaPeruComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private elRef: ElementRef
  ) { }

  ngOnInit(): void {
    this.documento = this.data;
    this.fileInIframe(this.documento, 'embeddedPage');
  }

  close(){
    this.dialogRef.close();
  }

  fileInIframe(resp: any, iframeId: string) {
    const byteArray = new Uint8Array(atob(resp).split('').map((char) => char.charCodeAt(0)));
    const file = new Blob([byteArray], { type: 'application/pdf' });
    const fileURL = URL.createObjectURL(file);
    const iframe: any = document.getElementById(iframeId) as HTMLIFrameElement;
    iframe.contentWindow.location.replace(fileURL);
  }

}
