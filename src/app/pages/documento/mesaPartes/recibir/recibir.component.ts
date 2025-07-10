import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Documento } from 'src/app/_model/documento.model';
import { DocumentoService } from 'src/app/_service/documento.service';
import Swal from 'sweetalert2';
import { RegistrarMPComponent } from '../registrar/registrarMP.component';
import { environment } from 'src/environments/environment';
import { ViewDocumentoComponent } from '../../view-documento/view-documento.component';
import { ExcelService } from 'src/app/_service/excel.service';
import { TimelineComponent } from 'src/app/pages/report/timeline/timeline.component';
import { SeguimientoComponent } from 'src/app/pages/report/seguimiento/seguimiento.component';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';

@Component({
  selector: 'app-recibir',
  templateUrl: './recibir.component.html',
  styleUrls: ['./recibir.component.css']
})
export class RecibirComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['Nro', 'Asunto','Documento', 'Origen', 'FechaDoc',  'Acciones'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  cargando: boolean;

  pageSize = 20;
  pageIndex = 0;
  totalElements: number = 0;

  constructor(private documentoService:DocumentoService,
    public dialog: MatDialog,
    private excelService: ExcelService
  ) { }

  ngOnInit(): void {
    this.cargando = true;
    this.loadTable(this.pageIndex, this.pageSize);
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe((sort: Sort) => {
      this.pageIndex = 0; // Reinicia a la primera página si cambia el orden
      this.loadTable(this.pageIndex, this.pageSize, sort.active, sort.direction);
    });
  }

  loadTable(page:any, size:any, sortField: string = 'codigo', sortDirection: string = 'desc'){
    this.documentoService.paginacionDocumento(
      sessionStorage.getItem(environment.codigoOrganizacion),page, size, sortField, sortDirection )
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

  viewSeguimiento(documentoSeleccionado?:any): void {
      const dialogRef = this.dialog.open(SeguimientoComponent, {
        width: '60%',
        height: '95%',
        data: documentoSeleccionado,
      });
    }

  exportTable() {
    this.excelService.exportTableToExcel('mytable', 'LISTA DE DOCUMENTOS RECIBIDOS');
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openDialog(documento?:Documento) {
    this.dialog.open(RegistrarMPComponent, {
      width: '90%',
      height: '80%',
      data: documento,
    });

  }

  verDocumento(documentoSeleccionado?:any): void {
    const dialogRef = this.dialog.open(ViewDocumentoComponent, {
      width: '60%',
      height: '95%',
      data: documentoSeleccionado,
    });
  }

}
