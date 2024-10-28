import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Documento } from 'src/app/_model/documento.model';
import { DocumentoService } from 'src/app/_service/documento.service';
import { AccionesComponent } from '../acciones/acciones.component';
import {MatPaginator} from '@angular/material/paginator';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { MatSort, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ExcelService } from 'src/app/_service/excel.service';



@Component({
  selector: 'app-pendiente',
  templateUrl: './pendiente.component.html',
  styleUrls: ['./pendiente.component.css'],

})
export class PendienteComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['Acciones', 'Nro',  'Asunto', 'Documento', 'Origen', 'FechaDoc','Prioridad'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  cargando: boolean;

  constructor(private documentoService: DocumentoService,
              public dialog: MatDialog,
            private excelService: ExcelService,
            private _liveAnnouncer: LiveAnnouncer) {
      this.dataSource = new MatTableDataSource<any>([]);
  }

  ngOnInit(): void {
    this.cargando = true;
    this.documentoService.findByOrganizacionDestino(sessionStorage.getItem(environment.codigoOrganizacion))
      .subscribe(
        {
          next : (data: Documento[]) => {
            this.createTable(data);
            this.cargando = false;

          }, error: err => {
            this.cargando = false;
            Swal.fire('Lo sentimos', err, 'warning');
          }
        }
    );
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

  ngAfterViewInit() {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openDialog(documentoSeleccionado: Documento) {
    this.dialog.open(AccionesComponent, {
      data: documentoSeleccionado,
      height: '90%',
      width: '100%',
    });
  }

  createTable(documentos: any[]) {
    this.dataSource.data = documentos;
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
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

  announceSortChange(sortState: Sort) {
    // This example uses English messages. If your application supports
    // multiple language, you would internationalize these strings.
    // Furthermore, you can customize the message to add additional
    // details about the values being sorted.
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
}
