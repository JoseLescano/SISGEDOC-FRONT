import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Documento } from 'src/app/_model/documento.model';
import { DocumentoService } from 'src/app/_service/documento.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { ViewDocumentoComponent } from '../view-documento/view-documento.component';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormControl } from '@angular/forms';
import { ExcelService } from 'src/app/_service/excel.service';
import { SeguimientoComponent } from '../../report/seguimiento/seguimiento.component';
import { TimelineComponent } from '../../report/timeline/timeline.component';

@Component({
  selector: 'app-buscar-documento',
  templateUrl: './buscar-documento.component.html',
  styleUrls: ['./buscar-documento.component.css']
})
export class BuscarDocumentoComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['Prioridad', 'Nro', 'Asunto', 'Documento', 'Origen', 'FechaDoc.', 'Decretado a.', 'Acciones'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  cargando: boolean = false;

  textoIngresado : string = '';

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  constructor(
    private documentoService: DocumentoService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private excelService: ExcelService
            ) { }

  ngOnInit(): void {
    this.generarReporte();
  }

  exportTable() {
    this.excelService.exportTableToExcel('tbDecretados', 'LISTA DE DOCUMENTOS DECRETADOS');
  }

  byTexto(){
    if (this.textoIngresado.trim() != '' || this.textoIngresado != null){
      this.cargando = true;
      this.documentoService.searchByOrganizacion(sessionStorage.getItem(environment.codigoOrganizacion), this.textoIngresado,
      '', '').subscribe((data: any) => {
        debugger;
        this.createTable(data);
        this.cargando = false;
      }, (error: any)=> {
        this.cargando = false;
        Swal.fire('Lo sentimos', `Se presento un inconveniente en la consulta`, 'warning');
      });
     }else {
       Swal.fire('LO SENTIMOS', 'INGRESE CAMPO REQUERIDO PARA LA BUSQUEDA', 'info');
     }
  }
  betweenFechas(){
    if (this.range.value['start']!= null && this.range.value['end']!=null){
      this.cargando = true;
      this.documentoService.searchByOrganizacion(sessionStorage.getItem(environment.codigoOrganizacion),'',
      environment.convertDateToStr(this.range.value['start']), environment.convertDateToStr(this.range.value['end'])).subscribe((data: any) => {
        debugger;
        this.createTable(data);
        this.cargando = false;
      }, (error: any)=> {
        this.cargando = false;
        Swal.fire('Lo sentimos', `Se presento un inconveniente en la consulta`, 'warning');
      });
     }else {
       Swal.fire('LO SENTIMOS', 'INGRESE CAMPOS REQUERIDOS PARA LA BUSQUEDA', 'info');
     }
  }



  viewTimeline(vidDocumento: any){
    const dialogRef = this.dialog.open(TimelineComponent, {
      width: '60%',
      height: '95%',
      data: vidDocumento,
    });
  }

  generarReporte(): void {
    this.cargando = true;

      this.documentoService.searchByOrganizacion(sessionStorage.getItem(environment.codigoOrganizacion), '').subscribe( {
        next : (data: any) =>{
          this.createTable(data);
          Swal.fire("LISTA DE DOCUMENTOS ENCONTRADOS", "SE OBTUVO DOCUMENTOS DE LOS ULTIMOS 7 DÍAS", "info");
          this.cargando = false;
        }, error: (error: any)=> {
         this.cargando = false;
          Swal.fire('Lo sentimos', `Se presento un inconveniente en la consulta`, 'warning');
      }});

  }

  ngAfterViewInit() {
    this.dataSource = null;
    if (this.dataSource!= null){
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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
  openDialog(documentoSeleccionado?:any): void {
    const dialogRef = this.dialog.open(ViewDocumentoComponent, {
      width: '60%',
      height: '95%',
      data: documentoSeleccionado,
    });
  }

  verRespuesta(documentoSeleccionado?:any): void {
    debugger;
    this.documentoService.verDocumentoRespuesta(documentoSeleccionado).subscribe(
      {
        next : (response: any)=> {
          debugger;
          const dialogRef = this.dialog.open(ViewDocumentoComponent, {
            width: '60%',
            height: '95%',
            data: response,
          });
        }, error : (err:any)=> {

        }
      }
    );

  }

  viewSeguimiento(documentoSeleccionado?:any): void {
    const dialogRef = this.dialog.open(SeguimientoComponent, {
      width: '60%',
      height: '95%',
      data: documentoSeleccionado,
    });
  }


}
