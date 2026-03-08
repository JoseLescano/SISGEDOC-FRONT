import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Documento } from 'src/app/_model/documento.model';
import { DocumentoService } from 'src/app/_service/documento.service';
import { AccionesComponent } from '../acciones/acciones.component';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { MatSort, Sort } from '@angular/material/sort';
import { ExcelService } from 'src/app/_service/excel.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';



@Component({
  selector: 'app-pendiente',
  templateUrl: './pendiente.component.html',
  styleUrls: ['./pendiente.component.css'],

})
export class PendienteComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['Acciones', 'Nro', 'Asunto', 'Documento', 'Origen', 'FechaDoc', 'Prioridad'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  cargando: boolean;

  pageSize = 20;
  pageIndex = 0;
  totalElements: number = 0;

  // Nuevas propiedades para el filtrado
  filterValue: string = '';
  private filterSubject = new Subject<string>();

  constructor(private documentoService: DocumentoService,
    public dialog: MatDialog,
    private excelService: ExcelService,) {
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
    this.pageIndex = 0; // Resetear a la primera página cuando se filtre
    this.loadTable(this.pageIndex, this.pageSize);
  }

  ngAfterViewInit() {
    if (this.sort) {
      this.sort.sortChange.subscribe((sort: Sort) => {
        this.pageIndex = 0; // Reinicia a la primera página si cambia el orden
        this.loadTable(this.pageIndex, this.pageSize, sort.active, sort.direction);
      });
    }
  }

  loadTable(page: any, size: any, sortField: string = 'codigo', sortDirection: string = 'desc') {
    this.documentoService.paginacionDocumento(
      sessionStorage.getItem(environment.codigoOrganizacion), page, size, sortField, sortDirection, this.filterValue)
      .subscribe(
        {
          next: (data: any) => {
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

  showMore(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    if (this.pageSize > 20)
      this.loadTable(this.pageIndex, this.pageSize, 'codigo', 'desc');
    else this.loadTable(this.pageIndex, this.pageSize);
  }


  downloadExcel(): void {
    this.excelService.downloadPendientes(
      sessionStorage.getItem(environment.codigoOrganizacion))
      .subscribe((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `documentos_pendientes.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }

  // Método modificado para filtrado del servidor
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    // Usar el Subject para implementar debounce
    this.filterSubject.next(filterValue.trim());
  }

  openDialog(documentoSeleccionado: Documento) {
    this.dialog.open(AccionesComponent, {
      data: documentoSeleccionado,
      height: '90%',
      width: '100%',
    });
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

}
