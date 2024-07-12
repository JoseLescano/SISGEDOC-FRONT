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



@Component({
  selector: 'app-pendiente',
  templateUrl: './pendiente.component.html',
  styleUrls: ['./pendiente.component.css'],

})
export class PendienteComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['Acciones', 'Nro', 'Asunto', 'Documento', 'Origen', 'FechaDoc.'];
  dataSource: MatTableDataSource<Documento> = new MatTableDataSource<Documento>();

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  cargando: boolean;

  constructor(private documentoService: DocumentoService,
              public dialog: MatDialog) { }

  ngOnInit(): void {
    this.cargando = true;
    this.documentoService.findByOrganizacionDestino(sessionStorage.getItem(environment.codigoOrganizacion))
      .subscribe((data: Documento[]) => {
        this.createTable(data);
        this.cargando = false;
      }, error => {
        this.cargando = false;
        Swal.fire('Lo sentimos', `Se presentó un inconveniente en la consulta`, 'warning');
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

  openDialog(documentoSeleccionado: Documento) {
    this.dialog.open(AccionesComponent, {
      data: documentoSeleccionado,
      height: '90%',
      width: '100%',
    });
  }

  createTable(documento: Documento[]) {
    this.dataSource.data = documento;
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }
}
