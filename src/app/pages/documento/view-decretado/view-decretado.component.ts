import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DocumentoService } from 'src/app/_service/documento.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { ViewDocumentoComponent } from '../view-documento/view-documento.component';
import { SeguimientoComponent } from '../../report/seguimiento/seguimiento.component';
import { FormControl, FormGroup } from '@angular/forms';
import { ExcelService } from 'src/app/_service/excel.service';
import { TimelineComponent } from '../../report/timeline/timeline.component';
import { ReporteDocumentoDecretoComponent } from '../../report/reporte-documento-decretado/reporte-documento-decretado.component';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-view-decretado',
  templateUrl: './view-decretado.component.html',
  styleUrls: ['./view-decretado.component.css']
})
export class ViewDecretadoComponent implements OnInit, AfterViewInit {

  columnasDefault: string[] = ['Prioridad', 'Nro', 'Asunto', 'Documento', 'Origen', 'FechaDoc.', 'Decretado a.', 'Acciones'];
  columnasFueraTiempo: string[] = ['Prioridad', 'Nro', 'Asunto', 'Documento', 'Origen', 'Decretado a.', 'Fecha Decreto', 'Limite', 'Progreso', 'Fecha Respuesta', 'Estado Plazo',  'Acciones'];

  displayedColumns: string[] = [];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  cargando: boolean;

  pageSize = 20;
  pageIndex = 0;
  totalElements: number = 0;

  modoBusqueda: 'rango' | 'dia'|'fueraTiempo' = 'rango'; // por defecto 'rango'
  verGrafica:boolean = false;

  cargandoDescarga: boolean = false;
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  rangeFueraTiempo = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  fechaSeleccionada: any;

  // Nuevas propiedades para el filtrado
  filterValue: string = '';
  private filterSubject = new Subject<string>();

  constructor(
    private documentoService: DocumentoService,
    public dialog: MatDialog,
    private excelService: ExcelService) {
    // Configurar debounce para el filtro (esperar 500ms después de que el usuario deje de escribir)
    this.filterSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(searchValue => {
      this.filterValue = searchValue;
      this.pageIndex = 0; // Resetear a la primera página cuando se filtre
      this.loadTable(this.pageIndex, this.pageSize);
    });
  }

  ngOnInit(): void {
    this.cargando = true;
    this.displayedColumns = this.columnasDefault;
    this.loadTable(this.pageIndex, this.pageSize);
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe((sort: Sort) => {
      this.pageIndex = 0; // Reinicia a la primera página si cambia el orden
      this.loadTable(this.pageIndex, this.pageSize, sort.active, sort.direction);
    });
  }

  // Método modificado para filtrado del servidor
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    // Usar el Subject para implementar debounce
    this.filterSubject.next(filterValue.trim());
  }

  loadTable(page: number, size: number, sortField: string = 'codigo', sortDirection: string = 'desc') {
    let fi='';
    let ff='';
    let codigoOrganizacion = sessionStorage.getItem(environment.codigoOrganizacion);
    if (this.modoBusqueda === 'rango') {
      this.verGrafica = false;
      if (this.range.value['start']!= null && this.range.value['end']!=null){
        fi = environment.convertDateToStr(this.range.value['start']);
        ff = environment.convertDateToStr(this.range.value['end']);
      }

      this.documentoService.findDecretados1(
        codigoOrganizacion, page, size, sortField, sortDirection, this.filterValue, fi, ff
      ).subscribe({
        next: (data: any) => {
          this.totalElements = data.totalElements;
          this.createTable(data.content);
          this.cargando = false;
        },
        error: err => {
          this.cargando = false;
          this.dataSource.data = null;
          Swal.fire('Lo sentimos', err, 'warning');
        }
      });
    } else if (this.modoBusqueda === 'dia') {
      this.verGrafica = false;
      this.documentoService.findDecretadosForDay(
        codigoOrganizacion, environment.convertDateToStr(this.fechaSeleccionada), page, size, sortField, sortDirection
      ).subscribe({
        next: (data: any) => {
          this.totalElements = data.totalElements;
          this.createTable(data.content);
          this.cargando = false;
        },
        error: err => {
          this.cargando = false;
          this.dataSource.data = null;
          Swal.fire('LO SENTIMOS', 'Se presentó un inconveniente en la consulta', 'warning');
        }
      });
    }else {
      this.verGrafica = false;
      if (this.rangeFueraTiempo.value['start']!= null && this.rangeFueraTiempo.value['end']!=null){
        fi = environment.convertDateToStr(this.rangeFueraTiempo.value['start']);
        ff = environment.convertDateToStr(this.rangeFueraTiempo.value['end']);
      }
      this.documentoService.viewDocumentoFueraTiempo(
        codigoOrganizacion, page, size, sortField, sortDirection, fi, ff
      ).subscribe({
        next: (data: any) => {
          this.totalElements = data.totalElements;
          this.createTable(data.content);
          this.cargando = false;
        },
        error: err => {
          this.cargando = false;
          this.dataSource.data = null;
          Swal.fire('LO SENTIMOS', 'Se presentó un inconveniente en la consulta', 'warning');
        }
      });
    }
  }

  createTable(documentos: any[]) {
    this.dataSource = new MatTableDataSource<any>();
    this.dataSource.data = documentos;
    setTimeout(() => {
      this.dataSource.sort = this.sort;

      this.dataSource.sortingDataAccessor = (item, property) => {
      debugger
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
    debugger
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    if (this.pageSize>20)
      this.loadTable(this.pageIndex, this.pageSize, 'codigo','desc');
    else this.loadTable(this.pageIndex, this.pageSize);
  }

  viewTimeline(vidDocumento: any){
    const dialogRef = this.dialog.open(TimelineComponent, {
      width: '60%',
      height: '95%',
      data: vidDocumento,
    });
  }

  buscarFechas() {
    this.modoBusqueda = 'rango';
    this.displayedColumns = this.columnasDefault;
    this.pageIndex = 0;
    this.pageSize = 20;
    if (this.range.value['start']!= null && this.range.value['end']!=null){
      this.cargando = true;
      this.loadTable(this.pageIndex, this.pageSize);
    } else {
      Swal.fire('AVISO', 'INGRESE FECHA', 'warning');
    }
  }

  fueraTiempo() {
    this.modoBusqueda = 'fueraTiempo';
    this.displayedColumns = this.columnasFueraTiempo;
    this.pageIndex = 0;
    this.pageSize = 20;
    if (this.rangeFueraTiempo.value['start']!= null && this.rangeFueraTiempo.value['end']!=null){
      this.cargando = true;
      this.loadTable(this.pageIndex, this.pageSize);
    } else {
      Swal.fire('AVISO', 'INGRESE FECHA', 'warning');
    }
  }

  buscarForDay() {
    this.modoBusqueda = 'dia';
    this.pageIndex = 0;
    this.pageSize = 20;
    this.displayedColumns = this.columnasDefault;
    if (this.fechaSeleccionada) {
      this.cargando = true;
      this.loadTable(this.pageIndex, this.pageSize);
    } else {
      Swal.fire('AVISO', 'INGRESE FECHA', 'warning');
    }
  }

  chart: Chart;

  cargarDatos() {
    this.verGrafica = true;
    let fi = '';
    let ff = '';
    let data;
    let codigoOrganizacion = sessionStorage.getItem(environment.codigoOrganizacion);
    if (this.rangeFueraTiempo.value['start']!= null && this.rangeFueraTiempo.value['end']!=null){
        fi = environment.convertDateToStr(this.rangeFueraTiempo.value['start']);
        ff = environment.convertDateToStr(this.rangeFueraTiempo.value['end']);
    }
    this.documentoService.documentoFueraTiempo(codigoOrganizacion, fi,ff)
    .subscribe(
      {
        next:(response: any)=> {
          data = response;
          const estados = {
            'FUERA DE PLAZO SIN RESPUESTA': 0,
            'FUERA DE PLAZO CON RESPUESTA': 0,
            'DENTRO DE PLAZO CON RESPUESTA': 0
          };

          data.forEach((doc: any) => {
            estados[doc.estadoPlazo] = (estados[doc.estadoPlazo] || 0) + 1;
          });

          this.generarGrafico(estados);
        }, error : (err:any)=> {
          console.log(err)
        }
      }
    );
  }

  generarGrafico(estados: any): void {
    const ctx = document.getElementById('controlChart') as HTMLCanvasElement;

    if (this.chart) {
      this.chart.destroy();
    }
    debugger


    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: Object.keys(estados),
        datasets: [{
          label: 'Cantidad de documentos',
          data: Object.values(estados),
          backgroundColor: ['#e74c3c', '#f1c40f', '#2ecc71'],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true },
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }


  calcularProgreso(row: any): number {
    if (!row.limite) return 100;

    const fechaLimite = this.parseFecha(row.limite);
    const fechaDecreto = row.decretado ? this.parseFecha(row.decretado) : new Date();

    const totalDias = Math.max(1, this.diasEntreFechas(fechaDecreto, fechaLimite));
    const diasTranscurridos = Math.max(0, this.diasEntreFechas(fechaDecreto, new Date()));

    const porcentaje = (diasTranscurridos / totalDias) * 100;
    return Math.min(Math.max(porcentaje, 0), 100);
  }

  calcularColorClase(row: any): string {
    if (!row.limite) return 'green';

    const fechaLimite = this.parseFecha(row.limite);
    const hoy = new Date();
    const diasRestantes = this.diasEntreFechas(hoy, fechaLimite);

    if (diasRestantes <= 0) {
      return 'red';
    } else if (diasRestantes <= 2) {
      return 'orange';
    } else {
      return 'green';
    }
  }

  private diasEntreFechas(fecha1: Date, fecha2: Date): number {
    const diff = fecha2.getTime() - fecha1.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  private parseFecha(fechaStr: string): Date {
    const [dia, mes, anio] = fechaStr.split('-').map(Number);
    return new Date(2000 + anio, mes - 1, dia); // Ajustar si viene con yy
  }

  imprimir(){
    if (this.range.value['start']!= null && this.range.value['end']!=null){
      this.cargandoDescarga = true;
      let data : any = {
        fechaInicio:  environment.convertDateToStr(this.range.value['start']),
        fechaFin: environment.convertDateToStr(this.range.value['end']),
        codigoOrganizacion: sessionStorage.getItem(environment.codigoOrganizacion)
      }
      const dialogRef = this.dialog.open(ReporteDocumentoDecretoComponent, {
        width: '60%',
        height: '95%',
        data: data
      });
      this.cargandoDescarga = false;
    } else {
      Swal.fire('LO SENTIMOS', 'INGRESE RANGO DE FECHA', 'info');
    }
  }

  exportTable() {
    this.cargandoDescarga = true;
    this.excelService.exportTableToExcel('tbDecretados', 'LISTA DE DOCUMENTOS DECRETADOS');
    this.cargandoDescarga = false;
  }

  downloadExcel(): void {
    if (this.range.value['start']!= null && this.range.value['end']!=null){
      this.cargandoDescarga = true;
      this.excelService.downloadDecretadosByFechas(
        sessionStorage.getItem(environment.codigoOrganizacion),
        environment.convertDateToStr(this.range.value['start']),
        environment.convertDateToStr(this.range.value['end']),
    ).subscribe((blob: Blob) => {
        this.descargarExporExcel(blob, "REPORTE DE DOCUMENTO DECRETADOS ENTRE FECHAS " );
        this.cargandoDescarga = false;
      }, error => {
        this.cargandoDescarga = false;
        Swal.fire("LO SENTIMOS", "SE PRESENTO UN INCONVENIENTE CON LA DESCARGA DEL EXCEL", "info")
      });
    }else {
      Swal.fire('LO SENTIMOS', 'INGRESE RANGO DE FECHA', 'info');
    }
  }

  downloadForDay(): void {
    if(this.fechaSeleccionada != null){
      this.cargandoDescarga = true;
      this.excelService.downloadDecretadosForDay(
        sessionStorage.getItem(environment.codigoOrganizacion),
        environment.convertDateToStr(this.fechaSeleccionada)
      ).subscribe((blob: Blob) => {
          this.descargarExporExcel(blob, "REPORTE DE DOCUMENTO DECRETADOS POR DÍA " );
          this.cargandoDescarga = false;
      }, error => {
          this.cargandoDescarga = false;
          Swal.fire("LO SENTIMOS", "SE PRESENTO UN INCONVENIENTE CON LA DESCARGA DEL EXCEL", "info")
      });
    }else {
      Swal.fire('LO SENTIMOS', 'INGRESE FECHA DE BUSQUEDA', 'info');
    }
  }

  descargarExporExcel(blob:any, nombreDescarga:any){
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nombreDescarga}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  openDialog(documentoSeleccionado?:any): void {
    const dialogRef = this.dialog.open(ViewDocumentoComponent, {
      width: '60%',
      height: '95%',
      data: documentoSeleccionado,
    });
  }

  viewSeguimiento(documentoSeleccionado?:any): void {
    const dialogRef = this.dialog.open(SeguimientoComponent, {
      width: '60%',
      height: '95%',
      data: documentoSeleccionado,
    });
  }

}
