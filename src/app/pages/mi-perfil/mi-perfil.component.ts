import { Component, OnInit } from '@angular/core';
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
  type : any = 'bar';
  codigoRol : any = sessionStorage.getItem(environment.rol);

  constructor(
    private documentoService: DocumentoService
  ) { }

  ngOnInit(): void {
    debugger;
    if (this.codigoRol== '000' || this.codigoRol== '002')
      this.createChart();
  }

  createChart() {
    let codigoOrganizacion = sessionStorage.getItem(environment.codigoOrganizacion);
    this.documentoService.findDecretadoForBarChart(codigoOrganizacion).subscribe({
      next: (response: any) => {
        let etiquetas = response.map(x => x.etiqueta);
        let valores = response.map(x => x.valor);
        this.barChart = new Chart('canvas', {
          type: 'bar',
          data: {
            labels: etiquetas,
            datasets: [{
              label: 'DOCUMENTOS EN BANDEJA DE MIS UU',
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
      },
      error: (err: any) => {
        Swal.fire('LO SENTIMOS', 'SE PRESENTO UN INCONVENIENTE', 'info');
      }
    });
  }


}
