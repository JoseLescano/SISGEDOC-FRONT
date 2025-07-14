import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
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

@Component({
  selector: 'app-view-decretado',
  templateUrl: './view-decretado.component.html',
  styleUrls: ['./view-decretado.component.css']
})
export class ViewDecretadoComponent implements OnInit, AfterViewInit {

  columnasDefault: string[] = ['Prioridad', 'Nro', 'Asunto', 'Documento', 'Origen', 'FechaDoc.', 'Decretado a.', 'Acciones'];
  columnasFueraTiempo: string[] = ['Prioridad', 'Nro', 'Asunto', 'Documento', 'Origen', 'Decretado a.', 'Fecha Decreto', 'Limite', 'Fecha Respuesta', 'Estado Plazo', 'Días Excedidos', 'Acciones'];

  displayedColumns: string[] = [];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  cargando: boolean;

  pageSize = 20;
  pageIndex = 0;
  totalElements: number = 0;

  modoBusqueda: 'rango' | 'dia'|'fueraTiempo' = 'rango'; // por defecto 'rango'

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

  constructor(
    private documentoService: DocumentoService,
    public dialog: MatDialog,
    private excelService: ExcelService) {}

  ngOnInit(): void {
    this.cargando = true;
    this.displayedColumns = this.columnasDefault;
    this.loadTable(this.pageIndex, this.pageSize);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  loadTable(page: number, size: number, sortField: string = 'codigo', sortDirection: string = 'desc') {
    let fi='';
    let ff='';  
    let codigoOrganizacion = sessionStorage.getItem(environment.codigoOrganizacion);
    if (this.modoBusqueda === 'rango') {
      if (this.range.value['start']!= null && this.range.value['end']!=null){
        fi = environment.convertDateToStr(this.range.value['start']);
        ff = environment.convertDateToStr(this.range.value['end']);
      } 
      this.documentoService.findDecretados1(
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
          Swal.fire('Lo sentimos', err, 'warning');
        }
      });
    } else if (this.modoBusqueda === 'dia') {
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
      fi = environment.convertDateToStr(this.rangeFueraTiempo.value['start']);
      ff = environment.convertDateToStr(this.range.value['end']);
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
