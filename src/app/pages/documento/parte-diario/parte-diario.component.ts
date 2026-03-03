import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Documento } from 'src/app/_model/documento.model';
import { DocumentoService } from 'src/app/_service/documento.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { ViewDocumentoComponent } from '../view-documento/view-documento.component';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { SeguimientoComponent } from '../../report/seguimiento/seguimiento.component';
import { TimelineComponent } from '../../report/timeline/timeline.component';

@Component({
  selector: 'app-parte-diario',
  templateUrl: './parte-diario.component.html',
  styleUrls: ['./parte-diario.component.css']
})
export class ParteDiarioComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['Nro', 'Asunto', 'Origen', 'Destino', 'FechaDoc', 'Documento', 'Acciones'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  cargando: boolean;

  pageSize = 20;
  pageIndex = 0;
  totalElements: number = 0;
  documentoSeleccionado: Documento;


  constructor(private documentoService: DocumentoService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.cargando = true;
    this.loadTable(this.pageIndex, this.pageSize);
  }

  loadTable(page: any, size: any, sortField: string = 'codigo', sortDirection: string = 'desc') {
    this.documentoService.findParaParte(
      sessionStorage.getItem(environment.codigoOrganizacion), page, size, sortField, sortDirection)
      .subscribe(
        {
          next: (data: any) => {
            this.totalElements = data.totalElements;
            this.createTable(data.content);
            this.cargando = false;
          }, error: err => {
            this.cargando = false;
            const msg = err.error?.message || err.message || err.statusText || err;
            Swal.fire('Lo sentimos', 'Error al cargar los documentos para firma: ' + msg, 'error');
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
        switch (property) {
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
    if (this.pageSize > 20)
      this.loadTable(this.pageIndex, this.pageSize, 'codigo', 'desc');
    else this.loadTable(this.pageIndex, this.pageSize);
  }

  viewTimeline(vidDocumento: any) {
    const dialogRef = this.dialog.open(TimelineComponent, {
      width: '60%',
      height: '95%',
      data: vidDocumento,
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  ngAfterViewInit() {
    if (this.sort) {
      this.sort.sortChange.subscribe((sort: Sort) => {
        this.pageIndex = 0; // Reinicia a la primera página si cambia el orden
        this.loadTable(this.pageIndex, this.pageSize, sort.active, sort.direction);
      });
    }
  }

  verDocumento(documentoSeleccionado?: any): void {
    const dialogRef = this.dialog.open(ViewDocumentoComponent, {
      width: '60%',
      height: '95%',
      data: documentoSeleccionado
    });
  }

  viewSeguimiento(documentoSeleccionado?: any): void {
    const dialogRef = this.dialog.open(SeguimientoComponent, {
      width: '60%',
      height: '95%',
      data: documentoSeleccionado,
    });
  }

}
