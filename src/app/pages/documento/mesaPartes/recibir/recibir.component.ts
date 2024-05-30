import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Documento } from 'src/app/_model/documento.model';
import { DocumentoService } from 'src/app/_service/documento.service';
import Swal from 'sweetalert2';
import { RegistrarMPComponent } from '../registrar/registrarMP.component';
import { environment } from 'src/environments/environment';
import { ViewDocumentoComponent } from '../../view-documento/view-documento.component';

@Component({
  selector: 'app-recibir',
  templateUrl: './recibir.component.html',
  styleUrls: ['./recibir.component.css']
})
export class RecibirComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['Nro', 'Asunto','Documento', 'Origen', 'FechaDoc',  'Acciones'];
  dataSource: MatTableDataSource<Documento>;
  cargando: boolean;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private documentoService:DocumentoService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.cargando = true;
    this.documentoService.findByOrganizacionDestino(sessionStorage.getItem(environment.codigoOrganizacion)).subscribe((data: any)=> {
      this.createTable(data);
      this.cargando = false;
    }, error=> {
      this.cargando=false;
      Swal.fire('Lo sentimos', `Se presento un inconveniente en la consulta`, 'warning');
    });
  }

  createTable(documento: Documento[]){
    this.dataSource = new MatTableDataSource(documento);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
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
