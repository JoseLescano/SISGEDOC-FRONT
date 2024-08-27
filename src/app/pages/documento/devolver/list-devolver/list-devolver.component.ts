import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Documento } from 'src/app/_model/documento.model';
import { DocumentoService } from 'src/app/_service/documento.service';
import { ExcelService } from 'src/app/_service/excel.service';
import { SeguimientoComponent } from 'src/app/pages/report/seguimiento/seguimiento.component';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { ViewDocumentoComponent } from '../../view-documento/view-documento.component';
import { TimelineComponent } from 'src/app/pages/report/timeline/timeline.component';

@Component({
  selector: 'app-list-devolver',
  templateUrl: './list-devolver.component.html',
  styleUrls: ['./list-devolver.component.css']
})
export class ListDevolverComponent implements OnInit {

  displayedColumns: string[] = ['Nro',  'Asunto', 'Documento', 'Origen', 'FechaDoc.','Prioridad', 'Acciones'];
  dataSource: MatTableDataSource<Documento> = new MatTableDataSource<Documento>();

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  cargando: boolean;

  constructor(
    private documentoService: DocumentoService,
    public dialog: MatDialog,
    private excelService: ExcelService,
    private _liveAnnouncer: LiveAnnouncer) { }

  ngOnInit(): void {
    this.cargando = true;
    this.documentoService.findDevueltosByOrganizacion(sessionStorage.getItem(environment.codigoOrganizacion))
      .subscribe((data: Documento[]) => {
        this.createTable(data);
        this.cargando = false;
      }, error => {
        this.cargando = false;
        Swal.fire('Lo sentimos', `Se presentó un inconveniente en la consulta`, 'warning');
      });
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
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  createTable(documento: Documento[]) {
    this.dataSource.data = documento;
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
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

  viewTimeline(vidDocumento: any){
    const dialogRef = this.dialog.open(TimelineComponent, {
      width: '60%',
      height: '95%',
      data: vidDocumento,
    });
  }

}
