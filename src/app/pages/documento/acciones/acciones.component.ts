import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Documento } from 'src/app/_model/documento.model';
import { DocumentoService } from 'src/app/_service/documento.service';

import Swal from 'sweetalert2';
import { DecetarComponent } from '../decetar/decetar.component';
import { environment } from 'src/environments/environment';
import { DecretoService } from 'src/app/_service/decreto.service';
import { DecretoDTO } from 'src/app/_DTO/DecretoDTO';
import { ViewDocumentoComponent } from '../view-documento/view-documento.component';
import { SeguimientoComponent } from '../../report/seguimiento/seguimiento.component';

@Component({
  selector: 'app-acciones',
  templateUrl: './acciones.component.html',
  styleUrls: ['./acciones.component.css']
})
export class AccionesComponent implements OnInit {

  url_pdf: any;
  idDocumento : any;
  errorPDF : boolean = false;

  constructor(
      // @Inject(MAT_DIALOG_DATA) public data: Documento,
      private elRef: ElementRef,
      private documentoService:DocumentoService,
      private route: ActivatedRoute,
      public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this. getIdDocumento();
  }

  getIdDocumento(): void {
    const id = +this.route.snapshot.paramMap.get('codigoDocumento');
    this.idDocumento = id;
    this.viewDocumento(id);
  }

  viewSeguimiento(documentoSeleccionado?:any): void {
    const dialogRef = this.dialog.open(SeguimientoComponent, {
      width: '60%',
      height: '95%',
      data: documentoSeleccionado,
    });
  }


  viewDocumento(vidDocumento: any){
    this.documentoService.viewPDF(vidDocumento).subscribe((response: any)=>{

      this.crearDocumento(response.data);
      this.errorPDF = false;
    }, (error:any) => {
      this.errorPDF = true;
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

  verSeguimiento(vidDocumento: any){
    this.documentoService.findDecretoByDocumento(vidDocumento).subscribe(data => {
      console.log(data)
    });
  }

  abrirDecretar(vidDocumento:any){
    const dialogRef = this.dialog.open(DecetarComponent, {
      width: '60%',
      height: '95%',
      data: vidDocumento
    });
  }

}
