import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Documento } from 'src/app/_model/documento.model';
import { DocumentoService } from 'src/app/_service/documento.service';
import { AccionesComponent } from '../acciones/acciones.component';
import { LiveAnnouncer } from '@angular/cdk/a11y';



@Component({
  selector: 'app-pendiente',
  templateUrl: './pendiente.component.html',
  styleUrls: ['./pendiente.component.css'],

})
export class PendienteComponent implements OnInit, AfterViewInit {

  documentos : Documento[];

  displayedColumns: string[] = ['#', 'Asunto', 'Documento', 'Origen', 'FechaDoc.', 'FechaReg.', 'Acciones'];
  dataSource: MatTableDataSource<Documento> = null;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private documentoService: DocumentoService,
              public dialog: MatDialog, private _liveAnnouncer: LiveAnnouncer) {
  }

  ngOnInit(): void {
    this.documentoService.findByOrganizacionDestino('3302010102').subscribe((data: any)=> {
      this.createTable(data);
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openDialog(documentoSeleccionado: any) {
    this.dialog.open(AccionesComponent, {
      data: documentoSeleccionado,
      height: '90%',
      width: '100%',
    });
  }

  createTable(documento: Documento[]){
    this.dataSource = new MatTableDataSource(documento);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
  }

  announceSortChange(sortState: any) {
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
