import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { DocumentoService } from 'src/app/_service/documento.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { ViewDocumentoComponent } from '../../view-documento/view-documento.component';
import { MatDialog } from '@angular/material/dialog';
import { SeguimientoComponent } from 'src/app/pages/report/seguimiento/seguimiento.component';
import { ArchivoService } from 'src/app/_service/archivo.service';
import { SustentacionComponent } from '../sustentacion/sustentacion.component';
import { ExcelService } from 'src/app/_service/excel.service';
import { FormGroup, FormControl } from '@angular/forms';
import { TimelineComponent } from 'src/app/pages/report/timeline/timeline.component';
import { MatSort, Sort } from '@angular/material/sort';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['Prioridad', 'Nro', 'Asunto', 'Origen', 'FechaDoc', 'Documento', 'Motivo',  'Acciones'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  cargando: boolean;
  cargangoLineal: boolean = false;

  pageSize = 20;
  pageIndex = 0;
  totalElements: number = 0;


  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  fechaSeleccionada : any;

  constructor(private documentoService: DocumentoService,
              private route: ActivatedRoute,
              private router: Router,
              public dialog: MatDialog,
            private archivoService:ArchivoService,
            private excelService: ExcelService) { }

  ngOnInit(): void {
    this.cargando = true;
    this.loadTable(this.pageIndex, this.pageSize);
  }

  loadTable(page:any, size:any, sortField: string = 'codigo', sortDirection: string = 'desc'){
    this.documentoService.findArchivados1ByOrganizacion(
      sessionStorage.getItem(environment.codigoOrganizacion),
      page, size, sortField, sortDirection )
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

  ngAfterViewInit() {
    this.sort.sortChange.subscribe((sort: Sort) => {
      this.pageIndex = 0; // Reinicia a la primera página si cambia el orden
      this.loadTable(this.pageIndex, this.pageSize, sort.active, sort.direction);
    });
  }

  showMore(event: PageEvent) {

    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;

    if (this.pageSize>20){
      this.cargangoLineal = true;
      this.loadTable(0, this.pageSize, 'codigo','desc');
    }
    else {
      this.cargangoLineal = true;
      this.loadTable(this.pageIndex, this.pageSize);
    }
    this.cargangoLineal = false;
  }

  exportTable() {
    this.excelService.exportTableToExcel('mytable', 'LISTA DE DOCUMENTOS ARCHIVADOS');
  }

  viewSeguimiento(documentoSeleccionado?:any): void {
    const dialogRef = this.dialog.open(SeguimientoComponent, {
      width: '60%',
      height: '95%',
      data: documentoSeleccionado,
    });
  }

  // generarReporte(): void {
  //   this.cargando = true;
  //   this.documentoService.findArchivados1ByOrganizacion(sessionStorage.getItem(environment.codigoOrganizacion)).subscribe((data: any) => {
  //     this.createTable(data);
  //     this.cargando = false;
  //   }, (error: any)=> {
  //      this.cargando = false;
  //     Swal.fire('Lo sentimos', `Se presento un inconveniente en la consulta`, 'warning');
  //   });
  // }

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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }



  openDialog(documentoSeleccionado?:any): void {
    const dialogRef = this.dialog.open(ViewDocumentoComponent, {
      width: '60%',
      height: '95%',
      data: documentoSeleccionado,
    });
  }

  viewJustificacion(vidDecreto:any){
    const dialogRef = this.dialog.open(SustentacionComponent, {
      width: '60%',
      height: '95%',
      data: vidDecreto,
    });
  }

  buscarFechas(){
    if (this.range.value['start']!= null && this.range.value['end']!=null){
      this.cargando = true;
      this.documentoService.findArchivados1ByOrganizacion(sessionStorage.getItem(environment.codigoOrganizacion),
      this.pageIndex, this.pageSize,
        environment.convertDateToStr(this.range.value['start']), environment.convertDateToStr(this.range.value['end'])).subscribe((data: any) => {
        this.createTable(data);
        this.cargando = false;
      }, (error: any)=> {
         this.cargando = false;
        Swal.fire('Lo sentimos', `Se presento un inconveniente en la consulta`, 'warning');
      });
    }else {
      Swal.fire('LO SENTIMOS', 'INGRESE RANGO DE FECHA', 'info');
    }
  }

  contexto: string = '';

  buscarPorContexto(contexto:any){
      this.cargando = true;
      // this.documentoService.findArchivadosByContexto(sessionStorage.getItem(environment.codigoOrganizacion),
      //   environment.convertDateToStr(this.range.value['start']),
      //   environment.convertDateToStr(this.range.value['end'])).subscribe((data: any) => {
      //   this.createTable(data);
      //   this.cargando = false;
      // }, (error: any)=> {
      //    this.cargando = false;
      //   Swal.fire('Lo sentimos', `Se presento un inconveniente en la consulta`, 'warning');
      // });
  }

  viewTimeline(vidDocumento: any){
    const dialogRef = this.dialog.open(TimelineComponent, {
      width: '60%',
      height: '95%',
      data: vidDocumento,
    });
  }


}
