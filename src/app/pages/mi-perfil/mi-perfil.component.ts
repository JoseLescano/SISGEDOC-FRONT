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

  displayedColumns: string[] = ['Nro', 'Asunto','Destino', 'FechaDecre','FechaLimite','FechaRespuesta', 'Vigente'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  cargando: boolean;

  pageSize = 20;
  pageIndex = 0;
  totalElements: number = 0;

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


  loadTable(page:any, size:any, sortField: string = 'documento', sortDirection: string = 'desc'){
    let codigoOrganizacion = sessionStorage.getItem(environment.codigoOrganizacion);
    this.documentoService.viewDocumentoFueraTiempo(
      codigoOrganizacion,page, size, sortField, sortDirection )
      .subscribe(
      {
        next : (data: any) => {
        this.totalElements = data.totalElements;
        this.createTable(data.content);
        this.cargando = false;
        }, error: err => {
        this.cargando = false;
        Swal.fire('Lo sentimos', err, 'warning');
        }
      }
    );
  }

  createTable(documentos: any[]) {
    this.dataSource = new MatTableDataSource<any>();
    this.dataSource.data = documentos;
    setTimeout(() => {
      this.dataSource.sort = this.sort;

      this.dataSource.sortingDataAccessor = (item, property) => {
      switch(property) {
        case 'Nro': return item.codigo;
        case 'Asunto': return item.asunto.toLowerCase();
        case 'FechaDoc': return item.fechaDocumento;
        case 'Documento': return item.clase + ' Nro. ' + item.nroOrden;
        case 'Origen': return item.remitente.toLowerCase();
        case 'Destino': return item.destinatario.toLowerCase();
        case 'Prioridad': return item.prioridad.toLowerCase();
        // Añade más casos según tus columnas
        default: return item[property];
      }
      };
    });
  }

  showMore(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    if (this.pageSize>20)
      this.loadTable(this.pageIndex, this.pageSize, 'documento','desc');
    else this.loadTable(this.pageIndex, this.pageSize);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
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
