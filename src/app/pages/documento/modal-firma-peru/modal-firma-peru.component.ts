import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DocumentoService } from 'src/app/_service/documento.service';

@Component({
  selector: 'app-modal-firma-peru',
  templateUrl: './modal-firma-peru.component.html',
  styleUrls: ['./modal-firma-peru.component.css']
})
export class ModalFirmaPeruComponent implements OnInit, AfterViewInit {

  errorPDF: boolean = false;
  documento: any = '';
  url_pdf: SafeResourceUrl | null = null;
  @ViewChild('embeddedPage') iframe: ElementRef<HTMLIFrameElement>;

  constructor(
    public dialogRef: MatDialogRef<ModalFirmaPeruComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private elRef: ElementRef,
    private documentoService: DocumentoService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.documento = this.data.documento;
  }

  ngAfterViewInit(): void {
    // Avoid NG0100: wrap in setTimeout to ensure Change Detection has finished
    setTimeout(() => {
      this.crearDocumento(this.documento);
    }, 0);
  }

  close() {
    this.dialogRef.close();
  }

  crearDocumento(base64: string) {
    let cleanBase64 = base64;
    // ensure base64 isn't null or empty
    if (!cleanBase64) return;

    if (base64.includes(',')) {
      cleanBase64 = base64.split(',')[1];
    }
    const byteArray = this.base64ToUint8Array(cleanBase64); // Safe parse
    const file = new Blob([byteArray as any], { type: 'application/pdf' });
    const fileURL = URL.createObjectURL(file);

    // Use DomSanitizer to trust the URL, otherwise Angular might block the iframe src (NG0904)
    const safeURL = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);

    this.url_pdf = safeURL;
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
