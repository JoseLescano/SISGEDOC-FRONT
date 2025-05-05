import { Component, OnInit } from '@angular/core';
import { Organizacion } from 'src/app/_model/organizacion';
import { DocumentoService } from 'src/app/_service/documento.service';
import { ExcelService } from 'src/app/_service/excel.service';
import { OrganizacionService } from 'src/app/_service/organizacion.service';
import Swal from 'sweetalert2';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-estadistica-sa',
  templateUrl: './estadistica-sa.component.html',
  styleUrls: ['./estadistica-sa.component.css']
})
export class EstadisticaSAComponent implements OnInit {

  cargandoNucleo : boolean;
  documentoBandejaBySuperAdm: boolean;
  barChart: Chart;
  barChartHorizontal: Chart;
  type : any = 'bar';
  mostrarDetalleGrafica: boolean = false;
  nucleos: Organizacion[] = [];
  nucleoSeleccionado: Organizacion = null;
  brigadas: Organizacion[] = [];
  brigadaSeleccionada: Organizacion = null;
  unidades: Organizacion[] = [];
  unidadSeleccionada: Organizacion = null;

  countPendientes:number=0;
  countFirmar:number=0;
  countArchivados:number=0;
  countRemitidos: number= 0;

  constructor(
    private documentoService: DocumentoService,
    private excelService: ExcelService,
    private organizacionService: OrganizacionService
  ) { }

  ngOnInit(): void {
    this.verNucleo();
  }

  verNucleo() {
    this.cargandoNucleo = true;
    this.organizacionService.getUnidadNucleo().subscribe((response:any)=> {
      this.nucleos = response.data;
    }, error => {
      Swal.fire('LO SENTIMOS', 'Error en la carga de nucleos', 'info');
    });
    //tDocumentoBandejaBySuperAdm
    this.documentoService.getDocumentoBandejaNucleo().subscribe({
      next: (response: any) => {
        this.cargandoNucleo = false;
        let etiquetas = response.map(x => x.etiqueta);
        let valores = response.map(x => x.valor);
        let ids = response.map(x => x.codigo);
        this.barChart = new Chart('canvas', {
          type: 'bar',
          data: {
            labels: etiquetas,
            datasets: [{
              label: 'DOCUMENTOS EN BANDEJA DE NUCLEOS',
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
            onClick: (event, elements) => {
              if (elements.length > 0) {
                const index = elements[0].index;
                let idSeleccionado = ids[index];
                this.documentoService.countStadisticForSuperADM(idSeleccionado).subscribe(
                  {
                    next : (response:any)=> {
                      debugger;
                      this.countPendientes = response.PENDIENTES;
                      this.countArchivados = response.ARCHIVADOS;
                      this.countFirmar = response.PARA_FIRMA;
                      this.countRemitidos = response.REMITIDOS;
                    }
                  }
                );
              }
            },
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
        this.cargandoNucleo = false;
        Swal.fire('LO SENTIMOS', 'SE PRESENTO UN INCONVENIENTE', 'info');
      }
    });
    this.cargandoNucleo = false;
    if (this.barChartHorizontal) {
      this.barChartHorizontal.destroy();
    }
  }

  mostrarGraficaDetalle(id: string, uu:string) {
    this.documentoBandejaBySuperAdm = true;
    //
    this.documentoService.getDocumentoBandejaBySuperAdm(id).subscribe({
      next: (response: any) => {
        this.documentoBandejaBySuperAdm = false;
        // Si ya existe un gráfico previo, destrúyelo.
        if (this.barChartHorizontal) {
          this.barChartHorizontal.destroy();
        }

        let etiquetas = response.map(x => x.etiqueta);
        let valores = response.map(x => x.valor);
        let ids = response.map(x => x.codigo);
        this.barChartHorizontal = new Chart('canvasHorizontal', {

          type: 'bar',
          data: {
            labels: etiquetas,
            datasets: [{
              indexAxis: 'y',
              label: `DOCUMENTOS EN BANDEJA DE LAS UU - ${uu}`,
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
          }
        });
      },
      error: (err: any) => {
        this.documentoBandejaBySuperAdm = false;
        Swal.fire('LO SENTIMOS', 'SE PRESENTO UN INCONVENIENTE', 'info');
      }
    });
    this.documentoBandejaBySuperAdm = false;
  }

  getChildren(){
    this.mostrarDetalleGrafica = false;
    this.brigadas = [];
    this.brigadaSeleccionada = null;
    this.unidades = [];
    this.unidadSeleccionada = null;
    this.organizacionService.getChildrenByCodigo(this.nucleoSeleccionado.codigoInterno).subscribe((response:any)=> {
      this.brigadas = response.data;
    });
    this.mostrarDetalle();
  }

  getUnidad(){
    this.unidades = [];
    this.unidadSeleccionada = null;
    this.organizacionService.getChildrenByCodigo(this.brigadaSeleccionada.codigoInterno).subscribe((response:any)=> {
      this.unidades = response.data;
    });
    this.mostrarDetalle();
  }

  mostrarDetalle(){
    this.mostrarDetalleGrafica = true;
    if (this.unidadSeleccionada!= null){
      this.mostrarGraficaDetalle(this.unidadSeleccionada.codigoInterno, this.unidadSeleccionada.acronimo);
    } else  if(this.brigadaSeleccionada!= null){
      this.mostrarGraficaDetalle(this.brigadaSeleccionada.codigoInterno, this.brigadaSeleccionada.acronimo);
    }else {
      this.mostrarGraficaDetalle(this.nucleoSeleccionado.codigoInterno, this.nucleoSeleccionado.acronimo);
    }
  }

  exportSuperAdm(){
    this.excelService.exportSuperAdm(this.nucleoSeleccionado.codigoInterno).subscribe((response:any)=> {
      this.descargarExporExcel(response, "REPORTE" );
    })
  }

  descargarExporExcel(blob:any, nombreDescarga:any){
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nombreDescarga}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

}
