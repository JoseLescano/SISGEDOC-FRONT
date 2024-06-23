import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Documento } from 'src/app/_model/documento.model';
import { DocumentoService } from 'src/app/_service/documento.service';
import { ViewDocumentoComponent } from '../../view-documento/view-documento.component';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroup } from '@angular/forms';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { SeguimientoComponent } from 'src/app/pages/report/seguimiento/seguimiento.component';

@Component({
  selector: 'app-reporte-documento',
  templateUrl: './reporte-documento.component.html',
  styleUrls: ['./reporte-documento.component.css']
})
export class ReporteDocumentoComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['Nro', 'Asunto','Documento', 'Origen', 'Destino', 'FechaDoc',  'Acciones'];
  dataSource: MatTableDataSource<Documento>;
  cargando: boolean;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  constructor(
    private documentoService:DocumentoService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
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

  verDocumento(documentoSeleccionado?:any): void {
    const dialogRef = this.dialog.open(ViewDocumentoComponent, {
      width: '60%',
      height: '95%',
      data: documentoSeleccionado,
    });
  }

  verDecretos(){
    this.cargando = true;
    this.documentoService.findDecretados(sessionStorage.getItem(environment.codigoOrganizacion),
      environment.convertDateToStr(this.range.value['start']), environment.convertDateToStr(this.range.value['end'])
    ).subscribe((response:any)=>{
      this.createTable(response);
      this.cargando = false;

    }, error => {
      this.cargando = false;
      Swal.fire(`LO SENTIMOS`, 'SE PRESENTO UN INCONVENIENTE CON EL REPORTE DE DOCUMENTOS', 'info');
    });
  }

  verEnviadosExterno(){
    this.cargando = true;
    this.documentoService.findEnviadosExternosMP(sessionStorage.getItem(environment.codigoOrganizacion)).subscribe((response:any)=>{
      this.createTable(response);
      this.cargando = false;
    }, error => {
      this.cargando = false;
      Swal.fire(`LO SENTIMOS`, 'SE PRESENTO UN INCONVENIENTE CON EL REPORTE DE DOCUMENTOS', 'info');
    });
  }

  verDocumentoRegistrados(){
    this.cargando = true;
    this.documentoService.findByOrganizacionDestino(sessionStorage.getItem(environment.codigoOrganizacion)).subscribe((data: any)=> {
      this.createTable(data);
      this.cargando = false;
    }, error=> {
      this.cargando=false;
      Swal.fire('Lo sentimos', `Se presento un inconveniente en la consulta`, 'warning');
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
