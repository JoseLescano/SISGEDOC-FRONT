import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Documento } from 'src/app/_model/documento.model';
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

  displayedColumns: string[] = ['Prioridad', 'Nro', 'Asunto', 'Documento', 'Origen', 'FechaDoc.', 'Decretado a.', 'Acciones'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  cargando: boolean;

  pageSize = 20;
  pageIndex = 0;
  totalElements: number = 0;

  cargandoDescarga: boolean = false;
  range = new FormGroup({
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

  loadTable(page:any, size:any, sortField: string = 'codigo', sortDirection: string = 'desc', fi?:any, ff?:any){
    let codigoOrganizacion = sessionStorage.getItem(environment.codigoOrganizacion);
    this.documentoService.findDecretados1(
      codigoOrganizacion,page, size, sortField, sortDirection, fi, ff )
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

  viewTimeline(vidDocumento: any){
    const dialogRef = this.dialog.open(TimelineComponent, {
      width: '60%',
      height: '95%',
      data: vidDocumento,
    });
  }

  buscarFechas(){
    if (this.range.value['start']!= null && this.range.value['end']!=null){
      this.cargando = true;
      this.loadTable(0,20,'codigo','desc',environment.convertDateToStr(this.range.value['start']),
         environment.convertDateToStr(this.range.value['end']));
    }else {
      Swal.fire('LO SENTIMOS', 'INGRESE RANGO DE FECHA', 'info');
    }
  }

  buscarForDay(){
    if (this.fechaSeleccionada!=null){
      this.cargando = true;
      this.documentoService.findDecretadosForDay(
        sessionStorage.getItem(environment.codigoOrganizacion),
        environment.convertDateToStr(this.fechaSeleccionada),0,20)
        .subscribe((data: any) => {
        this.createTable(data);
        this.cargando = false;
      }, (error: any)=> {
        this.cargando = false;
        Swal.fire('LO SENTIMOS', `Se presento un inconveniente en la consulta`, 'warning');
      });
    }else {
      Swal.fire('LO SENTIMOS', 'INGRESE FECHA', 'info');
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
