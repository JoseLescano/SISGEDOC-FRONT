import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DocumentoService } from 'src/app/_service/documento.service';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit {

  idDocumento: any = 0;
  decretos : any = [];
  estilosTipo: string[] = ['#41516C', '#FBCA3E', '#E24A68', '#1B5F8C', '#4CADAD'];
  estilosDelay: string[] = ['delay-3s', 'delay-2s', 'delay-1s'];
  constructor(
    @Inject(MAT_DIALOG_DATA) private data:any,
    private matDialog: MatDialogRef<TimelineComponent>,
    private documentoService:DocumentoService,
  ) { }

  ngOnInit(): void {
    this.idDocumento = this.data;
    this.viewDecretos();
    //this.asignarEstilosAleatorios();
  }

  viewDecretos(): void {
    this.documentoService.findDecretoGraficaByDocumento(this.idDocumento).subscribe((response: any) => {
      this.decretos = response.map(decreto => {
        const estiloTipoAleatorio = this.estilosTipo[Math.floor(Math.random() * this.estilosTipo.length)];
        return {
          ...decreto,
          estilo: estiloTipoAleatorio
        };
      });
    });
  }

}
