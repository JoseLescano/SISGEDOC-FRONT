import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Documento } from 'src/app/_model/documento.model';
import { DocumentoService } from 'src/app/_service/documento.service';
import { ViewDocumentoComponent } from '../../view-documento/view-documento.component';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroup } from '@angular/forms';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { SeguimientoComponent } from 'src/app/pages/report/seguimiento/seguimiento.component';
import { ExcelService } from 'src/app/_service/excel.service';
import { TimelineComponent } from 'src/app/pages/report/timeline/timeline.component';
import { ReporteDocumentoDecretoComponent } from 'src/app/pages/report/reporte-documento-decretado/reporte-documento-decretado.component';

@Component({
  selector: 'app-reporte-documento',
  templateUrl: './reporte-documento.component.html',
  styleUrls: ['./reporte-documento.component.css']
})
export class ReporteDocumentoComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['Prioridad', 'Nro', 'Asunto','Documento', 'Origen', 'Destino', 'FechaDoc',  'Acciones'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  cargando: boolean;

  pageSize = 20;
  pageIndex = 0;
  totalElements: number = 0;

  modoBusqueda: 'rangoDecretados' | 'diaDecretados'|'rangoRegistrados'| 'diaRegistrados' |'randoEnviados' | 'diaEnviados' = 'rangoDecretados'; 

  cargandoDescarga : boolean = false;
  titulo: string = "";
  tipoReporte : number = 0;
  forDay: boolean = false;

  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  fechaSeleccionada: any = "";

  constructor(
    private documentoService:DocumentoService,
    public dialog: MatDialog,
    private excelService: ExcelService
  ) { }

  ngOnInit(): void {
  }

  exportTable() {
    this.excelService.exportTableToExcel('mytable', 'LISTA DE DOCUMENTOS');
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
        this.loadTable(this.pageIndex, this.pageSize, 'codigo','desc');
      else this.loadTable(this.pageIndex, this.pageSize);
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe((sort: Sort) => {
      this.pageIndex = 0; // Reinicia a la primera página si cambia el orden
      this.loadTable(this.pageIndex, this.pageSize, sort.active, sort.direction);
    });
  }

  loadTable(page:any, size:any, sortField: string = 'codigo', sortDirection: string = 'desc'){
    let fi='';
    let ff='';
    if (this.range.value['start']!= null && this.range.value['end']!=null){
      fi = environment.convertDateToStr(this.range.value['start']);
      ff = environment.convertDateToStr(this.range.value['end']);
    }

    let codigoOrganizacion = sessionStorage.getItem(environment.codigoOrganizacion);
    if (this.modoBusqueda === 'rangoDecretados') {
      this.documentoService.findDecretados1(
        codigoOrganizacion, page, size, sortField, sortDirection, fi, ff)
        .subscribe(
        {
          next : (data: any) => {
          this.totalElements = data.totalElements;
          this.createTable(data.content);
          this.cargando = false;
          }, error: err => {
            this.cargando = false;
            this.dataSource.data = null;
            Swal.fire('Lo sentimos', err, 'warning');
          }
        }
      );
    }else if( this.modoBusqueda === 'diaDecretados'){
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
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  verDocumento(documentoSeleccionado?:any): void {
    const dialogRef = this.dialog.open(ViewDocumentoComponent, {
      width: '60%',
      height: '95%',
      data: documentoSeleccionado,
    });
  }

  verDecretos(){
    if (this.range.value['start']!= null && this.range.value['end']!=null){
      this.cargando = true;
      this.tipoReporte = 0;
      this.forDay = false;
      this.titulo = "LISTA DE DOCUMENTOS DECRETOS"
      this.loadTable(0,20);
    } else {
      Swal.fire('LO SENTIMOS', 'INGRESE RANGO DE FECHA', 'info');
    }
  }

  verEnviadosExterno(){
    if (this.range.value['start']!= null && this.range.value['end']!=null){
      this.cargando = true;
      this.tipoReporte = 2;
      this.forDay = false;
      this.titulo = "LISTA DE DOCUMENTOS ENVIADOS"
      this.documentoService.findEnviadosExternosMP(
        sessionStorage.getItem(environment.codigoOrganizacion),
        environment.convertDateToStr(this.range.value['start']),
        environment.convertDateToStr(this.range.value['end'])).subscribe((response:any)=>{
        this.createTable(response);
        this.cargando = false;
      }, error => {
        this.cargando = false;
        Swal.fire(`LO SENTIMOS`, 'SE PRESENTO UN INCONVENIENTE CON EL REPORTE DE DOCUMENTOS', 'info');
      });
    } else {
      Swal.fire('LO SENTIMOS', 'INGRESE RANGO DE FECHA', 'info');
    }
  }

  verEnviadosExternoForDay(){
    if (this.fechaSeleccionada!=null){
      this.cargando = true;
      this.tipoReporte = 2;
      this.forDay = true;
      this.titulo = "LISTA DE DOCUMENTOS ENVIADOS"
      this.documentoService.findEnviadosExternosMP(
        sessionStorage.getItem(environment.codigoOrganizacion),
        environment.convertDateToStr(this.fechaSeleccionada)).subscribe((response:any)=>{
        this.createTable(response);
        this.cargando = false;
      }, error => {
        this.cargando = false;
        Swal.fire(`LO SENTIMOS`, 'SE PRESENTO UN INCONVENIENTE CON EL REPORTE DE DOCUMENTOS', 'info');
      });
    } else {
      Swal.fire('LO SENTIMOS', 'INGRESE RANGO DE FECHA', 'info');
    }
  }

  verDocumentoRegistrados(){
    if (this.range.value['start']!= null && this.range.value['end']!=null){
      this.cargando = true;
      this.tipoReporte = 1;
      this.forDay = false;
      this.titulo = "LISTA DE DOCUMENTOS REGISTRADOS"
      this.documentoService.searchRegistrados(
        sessionStorage.getItem(environment.codigoOrganizacion),
        environment.convertDateToStr(this.range.value['start']),
        environment.convertDateToStr(this.range.value['end'])).subscribe((data: any)=> {
        this.createTable(data);
        this.cargando = false;
      }, error=> {
        this.cargando=false;
        Swal.fire('Lo sentimos', `Se presento un inconveniente en la consulta`, 'warning');
      });
    } else {
      Swal.fire('LO SENTIMOS', 'INGRESE RANGO DE FECHA', 'info');
    }
  }

  verDocumentoRegistradosForDay(){
    if (this.fechaSeleccionada!=null){
      this.cargando = true;
      this.tipoReporte = 1;
      this.forDay = true;
      this.titulo = "LISTA DE DOCUMENTOS REGISTRADOS"
      this.documentoService.searchRegistrados(
        sessionStorage.getItem(environment.codigoOrganizacion),
        environment.convertDateToStr(this.fechaSeleccionada)).subscribe((data: any)=> {
        this.createTable(data);
        this.cargando = false;
      }, error=> {
        this.cargando=false;
        Swal.fire('Lo sentimos', `Se presento un inconveniente en la consulta`, 'warning');
      });
    } else {
      Swal.fire('LO SENTIMOS', 'INGRESE RANGO DE FECHA', 'info');
    }
  }
  viewSeguimiento(documentoSeleccionado?:any): void {
    const dialogRef = this.dialog.open(SeguimientoComponent, {
      width: '60%',
      height: '95%',
      data: documentoSeleccionado,
    });
  }

  viewTimeline(vidDocumento: any){
    const dialogRef = this.dialog.open(TimelineComponent, {
      width: '60%',
      height: '95%',
      data: vidDocumento,
    });
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

  buscarDecratadosForDay(){
    if (this.fechaSeleccionada!=null){
      this.cargando = true;
      this.tipoReporte = 0;
      this.modoBusqueda = 'diaDecretados';
      this.forDay = true;
      this.titulo = "LISTA DE DOCUMENTOS DECRETADOS"
      this.loadTable(0,20);
    }else {
      Swal.fire('LO SENTIMOS', 'INGRESE FECHA', 'info');
    }
  }

  downloadExcel(): void {
    if (this.forDay){
      if (this.tipoReporte == 0){
        this.excelService.downloadDecretadosForDay(
          sessionStorage.getItem(environment.codigoOrganizacion),
          environment.convertDateToStr(this.fechaSeleccionada))
          .subscribe((blob: Blob) => {
            this.descargarExporExcel(blob, "REPORTE DE DOCUMENTO DECRETADOS POR FECHA" );
            this.cargandoDescarga = false;
          }, error => {
            this.cargandoDescarga = false;
            Swal.fire("LO SENTIMOS", "SE PRESENTO UN INCONVENIENTE CON LA DESCARGA DEL EXCEL", "info")
          });
      }
      if (this.tipoReporte == 1){
        this.excelService.exportRegistradosExcel(
          sessionStorage.getItem(environment.codigoOrganizacion),
          environment.convertDateToStr(this.fechaSeleccionada))
          .subscribe((blob: Blob) => {
            this.descargarExporExcel(blob, "REPORTE DE DOCUMENTO REGISTRADOS POR FECHA" );
            this.cargandoDescarga = false;
          }, error => {
            this.cargandoDescarga = false;
            Swal.fire("LO SENTIMOS", "SE PRESENTO UN INCONVENIENTE CON LA DESCARGA DEL EXCEL", "info")
          });
      }
      if (this.tipoReporte == 2){
        this.excelService.exportEnviadosExcel(
          sessionStorage.getItem(environment.codigoOrganizacion),
          environment.convertDateToStr(this.fechaSeleccionada))
          .subscribe((blob: Blob) => {
            this.descargarExporExcel(blob, "REPORTE DE DOCUMENTO ENVIADOS POR FECHA" );
            this.cargandoDescarga = false;
          }, error => {
            this.cargandoDescarga = false;
            Swal.fire("LO SENTIMOS", "SE PRESENTO UN INCONVENIENTE CON LA DESCARGA DEL EXCEL", "info")
          });
      }
    } else {
      if (this.tipoReporte == 0){
        this.excelService.downloadDecretadosByFechas(
          sessionStorage.getItem(environment.codigoOrganizacion),
          environment.convertDateToStr(this.range.value['start']),
          environment.convertDateToStr(this.range.value['end']))
          .subscribe((blob: Blob) => {
            this.descargarExporExcel(blob, "REPORTE DE DOCUMENTO DECRETADOS ENTRE FECHAS " );
            this.cargandoDescarga = false;
          }, error => {
            this.cargandoDescarga = false;
            Swal.fire("LO SENTIMOS", "SE PRESENTO UN INCONVENIENTE CON LA DESCARGA DEL EXCEL", "info")
          });
      }
      if (this.tipoReporte == 1){
        this.excelService.exportRegistradosExcel(
          sessionStorage.getItem(environment.codigoOrganizacion),
          environment.convertDateToStr(this.range.value['start']),
          environment.convertDateToStr(this.range.value['end']))
          .subscribe((blob: Blob) => {
            this.descargarExporExcel(blob, "REPORTE DE DOCUMENTO REGISTRADOS ENTRE FECHAS " );
            this.cargandoDescarga = false;
          }, error => {
            this.cargandoDescarga = false;
            Swal.fire("LO SENTIMOS", "SE PRESENTO UN INCONVENIENTE CON LA DESCARGA DEL EXCEL", "info")
          });
      }
      if (this.tipoReporte == 2){
        this.excelService.exportEnviadosExcel(
          sessionStorage.getItem(environment.codigoOrganizacion),
          environment.convertDateToStr(this.range.value['start']),
          environment.convertDateToStr(this.range.value['end']))
          .subscribe((blob: Blob) => {
            this.descargarExporExcel(blob, "REPORTE DE DOCUMENTO ENVIADOS ENTRE FECHAS " );
            this.cargandoDescarga = false;
          }, error => {
            this.cargandoDescarga = false;
            Swal.fire("LO SENTIMOS", "SE PRESENTO UN INCONVENIENTE CON LA DESCARGA DEL EXCEL", "info")
          });
      }
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

}
