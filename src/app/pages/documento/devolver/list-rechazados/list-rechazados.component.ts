import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DocumentoService } from 'src/app/_service/documento.service';
import { ExcelService } from 'src/app/_service/excel.service';
import { TimelineComponent } from 'src/app/pages/report/timeline/timeline.component';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { ViewDocumentoComponent } from '../../view-documento/view-documento.component';
import { SeguimientoComponent } from 'src/app/pages/report/seguimiento/seguimiento.component';

@Component({
  selector: 'app-list-rechazados',
  templateUrl: './list-rechazados.component.html',
  styleUrls: ['./list-rechazados.component.css']
})
export class ListRechazadosComponent implements OnInit {

  displayedColumns: string[] = ['Nro', 'Asunto', 'Origen','Destino', 'FechaDoc', 'Documento',  'Acciones'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  cargando: boolean= false;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });


  constructor(
    private documentoService: DocumentoService,
    public dialog: MatDialog,
    private excelService: ExcelService
  ) { }

  ngOnInit(): void {
    this.generarReporte('DOCUMENTOS ENCONTRADOS DE LOS ULTIMOS 7 DÍAS');
  }

  viewTimeline(vidDocumento: any){
    const dialogRef = this.dialog.open(TimelineComponent, {
      width: '60%',
      height: '95%',
      data: vidDocumento,
    });
  }

  exportTable() {
    this.excelService.exportTableToExcel('mytable', 'LISTA DE DOCUMENTOS REMITIDOS');
  }

  generarReporte(aviso: any, fi?:any, ff?:any): void {
    this.cargando = true;
    this.documentoService.findDevueltosForOrganizacion(sessionStorage.getItem(environment.codigoOrganizacion), fi, ff).subscribe( {
      next : (data: any) => {
        this.createTable(data);
        Swal.fire('AVISO', aviso, 'info')
        this.cargando = false;
      }, error: (err : any)=> {
        this.cargando = false;
        Swal.fire('Lo sentimos', `Se presento un inconveniente en la consulta`, 'warning');
      }
    });

  }

  createTable(documentos: any[]): void {
    this.dataSource = new MatTableDataSource(documentos);
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

  }

  verDocumento(documentoSeleccionado?:any): void {
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

  buscarFechas(){
    if (this.range.value['start']!= null && this.range.value['end']!=null){
      this.generarReporte('SE ENCONTRO DOCUMENTOS',
          environment.convertDateToStr(this.range.value['start']),
          environment.convertDateToStr(this.range.value['end']));
    }else {
      Swal.fire('LO SENTIMOS', 'INGRESE RANGO DE FECHA', 'info');
    }
  }

}
