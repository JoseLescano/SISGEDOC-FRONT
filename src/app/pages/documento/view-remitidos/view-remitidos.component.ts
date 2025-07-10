import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Documento } from 'src/app/_model/documento.model';
import { DocumentoService } from 'src/app/_service/documento.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { ViewDocumentoComponent } from '../view-documento/view-documento.component';
import { SeguimientoComponent } from '../../report/seguimiento/seguimiento.component';
import { FormGroup, FormControl } from '@angular/forms';
import { ExcelService } from 'src/app/_service/excel.service';
import { TimelineComponent } from '../../report/timeline/timeline.component';

@Component({
  selector: 'app-view-remitidos',
  templateUrl: './view-remitidos.component.html',
  styleUrls: ['./view-remitidos.component.css']
})
export class ViewRemitidosComponent implements OnInit {

  displayedColumns: string[] = ['Nro', 'Asunto', 'Origen','Destino', 'FechaDoc', 'Documento',  'Acciones'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  cargando: boolean;

  pageSize = 20;
  pageIndex = 0;
  totalElements: number = 0;

  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });


  // =======================================================================================================

  constructor(
    private documentoService: DocumentoService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private excelService: ExcelService
  ) { }

  // =======================================================================================================

  ngOnInit(): void {
    this.cargando = true;
    this.loadTable('DOCUMENTOS ENCONTRADOS DE LOS ULTIMOS 30 DÍAS', this.pageIndex, this.pageSize);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.sort.sortChange.subscribe((sort: Sort) => {
      this.pageIndex = 0; // Reinicia a la primera página si cambia el orden
      this.loadTable(null,this.pageIndex, this.pageSize, sort.active, sort.direction);
    });
  }

  // =======================================================================================================

  loadTable(title:any, page:any, size:any, sortField: string = 'codigo', sortDirection: string = 'desc'){
    this.documentoService.findRemitidos(
      sessionStorage.getItem(environment.codigoOrganizacion),page, size, sortField, sortDirection )
      .subscribe(
      {
        next : (data: any) => {
        this.totalElements = data.totalElements;
        this.createTable(data.content);
        if (title != null)
          Swal.fire('AVISO', title, 'success');
        this.cargando = false;
        }, error: err => {
        this.cargando = false;
        Swal.fire('Lo sentimos', err, 'warning');
        }
      }
    );
  }

  buscarFechas(){
    this.cargando = true;
    if (this.range.value['start']!= null && this.range.value['end']!=null){
      this.documentoService.findRemitidos(
      sessionStorage.getItem(environment.codigoOrganizacion), 0, 20, 'codigo', 'desc',
      environment.convertDateToStr(this.range.value['start']), 
      environment.convertDateToStr(this.range.value['end']))
      .subscribe(
      {
        next : (data: any) => {
        this.totalElements = data.totalElements;
        this.createTable(data.content);
        Swal.fire('AVISO', 'DOCUMENTO ENCONTRADOS', 'success');
        this.cargando = false;
        }, error: err => {
        this.cargando = false;
        Swal.fire('Lo sentimos', err, 'warning');
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
      this.loadTable(null,this.pageIndex, this.pageSize, 'codigo','desc');
    else this.loadTable(null,this.pageIndex, this.pageSize);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  verDocumento(documentoSeleccionado?:any): void {
    const dialogRef = this.dialog.open(ViewDocumentoComponent, {
      width: '60%',
      height: '95%',
      data: documentoSeleccionado,
    });
  }

  VerRespuesta(codigoPadre:any, copdigoDecreto: any): void {
    let documento : Documento = new Documento();
    this.documentoService.verDocumentoRespuesta(codigoPadre,copdigoDecreto).subscribe(
      {
        next : (response: any)=> {
          documento = {...response}
          const dialogRef = this.dialog.open(ViewDocumentoComponent, {
            width: '60%',
            height: '95%',
            data: documento,
        });
      },
      error : (err: any)=> {
        Swal.fire('LO SENTIMOS', 'NO PODEMOS CARGAR DOCUMENTOS PDF', 'error');
      }
    })
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

  exportTable() {
    this.excelService.exportTableToExcel('mytable', 'LISTA DE DOCUMENTOS REMITIDOS');
  }

}
