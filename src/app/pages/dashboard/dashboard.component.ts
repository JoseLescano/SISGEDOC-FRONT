import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';
import { DocumentoService } from 'src/app/_service/documento.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  cargando: boolean = false;
  pendientes: any = '000';
  parte: any = '000';
  atendidos : any = '000';

  barChart: any;
  type : any = 'bar';

  constructor(
    private router: Router,
    private documentoService: DocumentoService
  ) { }

  ngOnInit(): void {
    this.cargando = true;
    this.contadoresDashboard();
    this.cargando = false;
  }

  contadoresDashboard(){
    
    let codigoOrganizacion = sessionStorage.getItem(environment.codigoOrganizacion);
    this.documentoService.contadoresDashboard(codigoOrganizacion).subscribe((response:any)=> {
      this.pendientes = response[0] < 10 ? '00'+ response[0]: 
                        response[0] < 99 && response[0] >10 ? '0'+ response[0]: 
                        response[0];
      this.parte = response[1] < 10 ? '00'+ response[1]: 
                  response[1] < 99 && response[1] >10 ? '0'+ response[1]: 
                  response[1];
    });

    this.createChart();
    
  }

  viewPendientes(){
    this.router.navigate(['/principal/pendientes']);
  }
  viewParteDiario(){
    this.router.navigate(['/principal/parte-diario']);
  }
  viewRemitidos(){
    this.router.navigate(['/principal/list-remitidos']);
  }

  createChart(){
    let codigoOrganizacion = sessionStorage.getItem(environment.codigoOrganizacion);
    this.documentoService.findDecretadoForBarChart(codigoOrganizacion).subscribe({
      next: (response: any)=> {
        let etiquetas = response.map(x => x.etiqueta)
        let valores = response.map(x => x.valor)
        this.barChart = new Chart('canvas', {
          type: this.type,
    
          data: {
            // values on X-Axis
            labels: etiquetas,
            datasets: [
              {
                label: 'DOCUMENTOS DECRETADOS',
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
                borderWidth: 1,
                // backgroundColor: 'blue'
              },
            ],
          },
          options: {
            aspectRatio: 2.5,
            responsive: true,
          },
        });
      }, error : (err: any)=> {
        Swal.fire('LO SENTIMOS', 'SE PRESENTO UN INCONVENIENTE', 'info');
      }
    });
    
  }

}
