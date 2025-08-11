import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DocumentoService } from 'src/app/_service/documento.service';
import { ViewDocumentoComponent } from '../view-documento/view-documento.component';
import { SeguimientoComponent } from '../../report/seguimiento/seguimiento.component';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-search-sa',
  templateUrl: './search-sa.component.html',
  styleUrls: ['./search-sa.component.css']
})
export class SearchSAComponent implements OnInit, AfterViewInit {

  displayedBusqueda: string[] = ['Nro',  'Documento', 'Origen', 'Destino', 'Asunto','FechaDoc.', 'Acciones'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  busquedaDocumentoByAdm: any;
  cargando: boolean;

  pageSize = 20;
  pageIndex = 0;
  totalElements: number = 0;

  constructor(
    private documentoService: DocumentoService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe((sort: Sort) => {
      this.pageIndex = 0; // Reinicia a la primera página si cambia el orden
      this.loadTable(this.pageIndex, this.pageSize, sort.active, sort.direction);
    });
  }

  loadTable(page:any, size:any, sortField: string = 'codigo', sortDirection: string = 'desc'){
    this.documentoService.findBySuperAdm(this.busquedaDocumentoByAdm,page, size, sortField, sortDirection )
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


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // createTableBusqueda(documento: any[]) {
  //   this.displayedBusqueda.data = documento;
  //     this.displayedBusqueda.paginator = this.paginatorBusqueda;
  //     this.displayedBusqueda.sort = this.sortBusqueda;
  // }

  // busquedaDocumentoBySuperADM(){
  //   this.documentoService.findBySuperAdm(this.busquedaDocumentoByAdm).subscribe({
  //     next: (response: any)=> {
  //       this.createTableBusqueda(response);
  //     }
  //   });
  // }

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
