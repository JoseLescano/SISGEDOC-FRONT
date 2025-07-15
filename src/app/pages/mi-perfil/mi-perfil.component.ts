import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { DocumentoService } from 'src/app/_service/documento.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.css']
})
export class MiPerfilComponent implements OnInit {

  barChart: any;
  codigoRol : any = sessionStorage.getItem(environment.rol);

  constructor(
    private documentoService: DocumentoService
  ) { }

  ngOnInit(): void {
    if (this.codigoRol== '000' || this.codigoRol== '002'){
      this.getDocumentosEnBandeja();
      this.getDocumentoDecretados7dias();
    }
  }

  getDocumentosEnBandeja() {
    let codigoOrganizacion = sessionStorage.getItem(environment.codigoOrganizacion);
    this.documentoService.findDecretadoForBarChart(codigoOrganizacion).subscribe({
      next: (response: any) => {
        this.createGrafigo('DOCUMENTOS EN BANDEJA DE MIS UU', 'canvas',
          response.map(x => x.etiqueta), response.map(x => x.valor),'bar','x');
      },
      error: (err: any) => {
        Swal.fire('LO SENTIMOS', 'SE PRESENTO UN INCONVENIENTE', 'info');
      }
    });
  }

  getDocumentoDecretados7dias(){
    let codigoOrganizacion = sessionStorage.getItem(environment.codigoOrganizacion);
    this.documentoService.getDecretados7dias(codigoOrganizacion).subscribe({
      next: (response: any) => {
        this.createGrafigo('DECRETOS REALIZADOS - ÚLTIMOS 15 DÍAS', 'canvasDecretos',
          response.map(x => x.etiqueta), response.map(x => x.valor),'line', 'x');
      },
      error: (err: any) => {
        Swal.fire('LO SENTIMOS', 'SE PRESENTO UN INCONVENIENTE', 'info');
      }
    });
  }

  createGrafigo(titulo:any, contenedor:any, etiquetas:any, valores:any, tipoGrafico:any, indexAxis:any){
    this.barChart = new Chart(contenedor, {
      type: tipoGrafico,
      data: {
        labels: etiquetas,
        datasets: [{
          indexAxis: indexAxis,
          label: titulo,
          data: valores,
          backgroundColor: [
            'rgba(54, 162, 235, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(201, 203, 207, 0.2)',
            'rgba(255, 99, 132, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(255, 205, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
          ],
          borderColor: [
            'rgb(54, 162, 235)',
            'rgb(153, 102, 255)',
            'rgb(201, 203, 207)',
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
          ],
          borderWidth: 1
        }],
      },
      options: {
        aspectRatio: 2.5,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          datalabels: {
            anchor: 'end',
            align: 'end',
            formatter: function(value) {
              return 'Total: ' + value;
            },
            font: {
              weight: 'bold'
            },
            offset: -5,

          }
        }
      },
      plugins: [ChartDataLabels]
    });
  }


}
