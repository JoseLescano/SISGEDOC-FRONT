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

  cargandoNucleo: boolean;
  documentoBandejaBySuperAdm: boolean;
  barChart: Chart;
  barChartHorizontal: Chart;
  type: any = 'bar';
  mostrarDetalleGrafica: boolean = false;
  nucleos: Organizacion[] = [];
  nucleoSeleccionado: Organizacion = null;
  brigadas: Organizacion[] = [];
  brigadaSeleccionada: Organizacion = null;
  unidades: Organizacion[] = [];
  unidadSeleccionada: Organizacion = null;

  countPendientes: number = 0;
  countFirmar: number = 0;
  countArchivados: number = 0;
  countRemitidos: number = 0;

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
    this.organizacionService.getUnidadNucleo().subscribe((response: any) => {
      this.nucleos = response.data;
    }, error => {
      Swal.fire('LO SENTIMOS', 'Error en la carga de nucleos', 'info');
    });
    //tDocumentoBandejaBySuperAdm
    this.documentoService.getDocumentoBandejaNucleo().subscribe({
      next: (response: any) => {
        this.cargandoNucleo = false;
        let etiquetas = response.map(x => x.etiqueta);
        let ids = response.map(x => x.codigo);
        this.barChart = new Chart('canvas', {
          type: 'bar',
          data: {
            labels: etiquetas,
            datasets: [
              { label: 'Pendientes', data: response.map(x => x.pendientes), backgroundColor: 'rgba(54, 162, 235, 0.8)' },
              { label: 'Por Firmar', data: response.map(x => x.firmar), backgroundColor: 'rgba(153, 102, 255, 0.8)' },
              { label: 'Archivados', data: response.map(x => x.archivados), backgroundColor: 'rgba(201, 203, 207, 0.8)' },
              { label: 'Remitidos', data: response.map(x => x.remitidos), backgroundColor: 'rgba(255, 99, 132, 0.8)' }
            ],
          },
          options: {
            aspectRatio: 2.5,
            responsive: true,
            scales: {
              x: { stacked: true },
              y: { stacked: true }
            },
            onClick: (event, elements) => {
              if (elements.length > 0) {
                const index = elements[0].index;
                let idSeleccionado = ids[index];
                this.documentoService.countStadisticForSuperADM(idSeleccionado).subscribe(
                  {
                    next: (response: any) => {
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
                anchor: 'center',
                align: 'center',
                color: '#fff',
                formatter: function (value) {
                  return value > 0 ? value : '';
                },
                font: {
                  weight: 'bold'
                }
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

  mostrarGraficaDetalle(id: string, uu: string) {
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
        this.barChartHorizontal = new Chart('canvasHorizontal', {

          type: 'bar',
          data: {
            labels: etiquetas,
            datasets: [
              { indexAxis: 'y', label: 'Pendientes', data: response.map(x => x.pendientes), backgroundColor: 'rgba(54, 162, 235, 0.8)' },
              { indexAxis: 'y', label: 'Por Firmar', data: response.map(x => x.firmar), backgroundColor: 'rgba(153, 102, 255, 0.8)' },
              { indexAxis: 'y', label: 'Archivados', data: response.map(x => x.archivados), backgroundColor: 'rgba(201, 203, 207, 0.8)' },
              { indexAxis: 'y', label: 'Remitidos', data: response.map(x => x.remitidos), backgroundColor: 'rgba(255, 99, 132, 0.8)' }
            ],
          },
          options: {
            aspectRatio: 2.5,
            responsive: true,
            scales: {
              x: { stacked: true },
              y: { stacked: true }
            },
            plugins: {
              datalabels: {
                anchor: 'center',
                align: 'center',
                color: '#fff',
                formatter: function (value) {
                  return value > 0 ? value : '';
                },
                font: {
                  weight: 'bold'
                }
              }
            }
          },
          plugins: [ChartDataLabels]
        });
      },
      error: (err: any) => {
        this.documentoBandejaBySuperAdm = false;
        Swal.fire('LO SENTIMOS', 'SE PRESENTO UN INCONVENIENTE', 'info');
      }
    });
    this.documentoBandejaBySuperAdm = false;
  }

  getChildren() {
    this.mostrarDetalleGrafica = false;
    this.brigadas = [];
    this.brigadaSeleccionada = null;
    this.unidades = [];
    this.unidadSeleccionada = null;
    this.organizacionService.getChildrenByCodigo(this.nucleoSeleccionado.codigoInterno).subscribe((response: any) => {
      this.brigadas = response.data;
    });
    this.mostrarDetalle();
  }

  getUnidad() {
    this.unidades = [];
    this.unidadSeleccionada = null;
    this.organizacionService.getChildrenByCodigo(this.brigadaSeleccionada.codigoInterno).subscribe((response: any) => {
      this.unidades = response.data;
    });
    this.mostrarDetalle();
  }

  mostrarDetalle() {
    this.mostrarDetalleGrafica = true;
    if (this.unidadSeleccionada != null) {
      this.mostrarGraficaDetalle(this.unidadSeleccionada.codigoInterno, this.unidadSeleccionada.acronimo);
    } else if (this.brigadaSeleccionada != null) {
      this.mostrarGraficaDetalle(this.brigadaSeleccionada.codigoInterno, this.brigadaSeleccionada.acronimo);
    } else {
      this.mostrarGraficaDetalle(this.nucleoSeleccionado.codigoInterno, this.nucleoSeleccionado.acronimo);
    }
  }

  exportSuperAdm() {
    this.excelService.exportSuperAdm(this.nucleoSeleccionado.codigoInterno).subscribe((response: any) => {
      this.descargarExporExcel(response, "REPORTE");
    })
  }

  descargarExporExcel(blob: any, nombreDescarga: any) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nombreDescarga}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

}
