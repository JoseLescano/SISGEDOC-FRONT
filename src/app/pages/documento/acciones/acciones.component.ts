import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { DocumentoService } from 'src/app/_service/documento.service';
import Swal from 'sweetalert2';
import { SeguimientoComponent } from '../../report/seguimiento/seguimiento.component';
import { TimelineComponent } from '../../report/timeline/timeline.component';
import { AnexoService } from 'src/app/_service/anexo.service';
import { Anexo } from 'src/app/_model/anexo';
import { environment } from 'src/environments/environment';
import { RegistrarComponent } from '../archivar/registrar/registrar.component';
import { DecretoService } from 'src/app/_service/decreto.service';

@Component({
  selector: 'app-acciones',
  templateUrl: './acciones.component.html',
  styleUrls: ['./acciones.component.css'],
})
export class AccionesComponent implements OnInit {
  url_pdf: any;
  idDocumento: any;
  codigoDecreto: any;
  errorPDF: boolean = false;
  anexos: Anexo[] = [];
  observaciones: string = 'SIN OBSERVACIONES';

  constructor(
    // @Inject(MAT_DIALOG_DATA) public data: Documento,
    private elRef: ElementRef,
    private documentoService: DocumentoService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private anexoService: AnexoService,
    private decretoService: DecretoService
  ) {}

  ngOnInit(): void {
    this.getIdDocumento();
  }

  getIdDocumento(): void {
    const id = +this.route.snapshot.paramMap.get('codigoDocumento');
    this.codigoDecreto = +this.route.snapshot.paramMap.get('idDecreto');
    this.idDocumento = id;
    this.viewDocumento(id);
    this.decretoService.listarPorId(this.codigoDecreto).subscribe({
      next: (response: any) => {
        console.log(response);
        if (response.observacion != null)
          this.observaciones = response.observacion;
      },
      error: (err: any) => {
        Swal.fire('Aviso', err.message, 'warning');
      },
    });
  }

  viewSeguimiento(documentoSeleccionado?: any): void {
    const dialogRef = this.dialog.open(SeguimientoComponent, {
      width: '60%',
      height: '95%',
      data: documentoSeleccionado,
    });
  }

  goArchivar(idDocumento: any, idDecreto: any): void {
    let data: any = {
      documento: idDocumento,
      decreto: idDecreto,
    };
    const dialogRef = this.dialog.open(RegistrarComponent, {
      width: '80%',
      data: data,
    });
  }

  viewDocumento(vidDocumento: any) {
    this.documentoService.viewPDF(vidDocumento).subscribe({
      next: (response: any) => {
        this.crearDocumento(response.data);
        this.documentoService
          .registrarVisualizacion(
            vidDocumento,
            sessionStorage.getItem(environment.codigoOrganizacion)
          )
          .subscribe(
            (response: any) => {},
            (error) => {
              Swal.fire(
                'LO SENTIMOS',
                `SE PRESENTO UN INCONVENIENTE EN CARGAR PDF!`,
                'warning'
              );
            }
          );
      },
      error: (err: any) => {
        this.errorPDF = false;
        Swal.fire(
          'LO SENTIMOS',
          `SE PRESENTO UN INCONVENIENTE EN CARGAR PDF!`,
          'warning'
        );
      },
    });
    this.findAnexosByDocumento();

  }

  viewGrafica(vidDocumento: any) {
    const dialogRef = this.dialog.open(TimelineComponent, {
      width: '60%',
      height: '95%',
      data: vidDocumento,
    });
  }

  crearDocumento(resp: any) {
    let byteArray = new Uint8Array(
      atob(resp[0])
        .split('')
        .map((char) => char.charCodeAt(0))
    );
    let file = new Blob([byteArray], { type: 'application/pdf' });
    let fileURL = URL.createObjectURL(file);
    this.url_pdf = fileURL;
    let iframe: any = this.elRef.nativeElement.querySelector(
      'iframe'
    ) as HTMLIFrameElement;
    iframe.contentWindow.location.replace(fileURL);
  }

  findAnexosByDocumento() {
    this.anexoService.findByDocumento(this.idDocumento).subscribe(
      (response: any) => {
        this.anexos = response.data;
      },
      (error) => {
        Swal.fire(
          'LO SENTIMOS',
          `SE PRESENTO UN INCONVENIENTE EN CARGAR ANEXOS!`,
          'warning'
        );
      }
    );
  }

  descargarAnexo(anexo: Anexo) {
    this.anexoService.descargarAnexo(anexo).subscribe(
      (resp: any) => {
        if (resp == null) {
          Swal.fire(
            'Lo sentimos',
            `Archivo no disponible y/o no se encuentra`,
            'error'
          );
        } else {
          let extension = anexo.url.split('.').pop();
          extension = extension.toUpperCase();

          if (extension == 'PDF') {
            this.downloadPDF(resp[0]);
          }

          if (extension == 'DOC' || extension == 'DOCX') {
            this.downloadWord(resp[0]);
          }

          if (extension == 'XLSX' || extension == 'XLS') {
            this.downloadExcel(resp[0]);
          }

          if (extension == 'PPT' || extension == 'PPTX') {
            this.downloadPPT(resp[0]);
          }

          if (extension == 'RAR' || extension == 'rar' || extension == 'ZIP') {
            this.downloadRar(resp[0]);
          }
        }
      },
      (error) => {
        Swal.fire(
          'LO SENTIMOS',
          `SE PRESENTO UN INCONVENIENTE EN DESCARGAR ANEXO!`,
          'warning'
        );
      }
    );
  }

  downloadPDF(pdf: any) {
    const linkSource = `data:application/pdf;base64,${pdf}`;
    const downloadLink = document.createElement('a');
    const fileName = this.generarNombreArchivo() + '.pdf';
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }
  downloadPPT(ppt: any) {
    const linkSource = `data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,${ppt}`;
    const downloadLink = document.createElement('a');
    const fileName = this.generarNombreArchivo() + '.pptx';
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }

  downloadExcel(excel: any) {
    const linkSource = `data:application/vnd.ms-excel;base64,${excel}`;
    const downloadLink = document.createElement('a');
    const fileName = this.generarNombreArchivo() + '.xlsx';
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }

  generarNombreArchivo(): any {
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
    const blob: any = new Blob([byteArray], {
      type: 'application/x-rar-compressed',
    });

    // Crear un enlace temporal y descargar el archivo
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = this.generarNombreArchivo() + '.rar';

    // Simular un clic en el enlace para descargar el archivo
    link.click();
  }

  downloadWord(word: any) {
    const linkSource = `data:application/msword;base64,${word}`;
    const downloadLink = document.createElement('a');
    const fileName = this.generarNombreArchivo() + '.docx';
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }
}
