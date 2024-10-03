import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Documento } from 'src/app/_model/documento.model';
import { DocumentoService } from 'src/app/_service/documento.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { ViewDocumentoComponent } from '../../view-documento/view-documento.component';
import { MatDialog } from '@angular/material/dialog';
import { DocumentoView } from 'src/app/_DTO/DocumentoView';
import { SeguimientoComponent } from 'src/app/pages/report/seguimiento/seguimiento.component';
import { ArchivoService } from 'src/app/_service/archivo.service';
import { SustentacionComponent } from '../sustentacion/sustentacion.component';
import { ExcelService } from 'src/app/_service/excel.service';
import { FormGroup, FormControl } from '@angular/forms';
import { TimelineComponent } from 'src/app/pages/report/timeline/timeline.component';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit, AfterViewInit {

  // displayedColumns: string[] = ['Estado', 'Nro', 'Origen', 'FechaDoc', 'Documento', 'Asunto', 'Motivo', 'Acciones'];
  displayedColumns: string[] = ['Prioridad', 'Nro', 'Asunto', 'Origen', 'FechaDoc', 'Documento', 'Motivo',  'Acciones'];
  dataSource: MatTableDataSource<DocumentoView>;
  cargando: boolean = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  fechaSeleccionada : any;

  constructor(private documentoService: DocumentoService,
              private route: ActivatedRoute,
              private router: Router,
              public dialog: MatDialog,
            private archivoService:ArchivoService,
            private excelService: ExcelService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.generarReporte();
    });
  }

  exportTable() {
    this.excelService.exportTableToExcel('mytable', 'LISTA DE DOCUMENTOS ARCHIVADOS');
  }

  viewSeguimiento(documentoSeleccionado?:any): void {
    const dialogRef = this.dialog.open(SeguimientoComponent, {
      width: '60%',
      height: '95%',
      data: documentoSeleccionado,
    });
  }

  generarReporte(): void {
    this.cargando = true;
    this.documentoService.findArchivados1ByOrganizacion(sessionStorage.getItem(environment.codigoOrganizacion)).subscribe((data: any) => {
      debugger;
      this.createTable(data);
      this.cargando = false;
    }, (error: any)=> {
       this.cargando = false;
      Swal.fire('Lo sentimos', `Se presento un inconveniente en la consulta`, 'warning');
    });
  }

  createTable(documentos: DocumentoView[]): void {
    this.dataSource = new MatTableDataSource(documentos);
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  ngAfterViewInit() {
    this.dataSource = null;
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  openDialog(documentoSeleccionado?:any): void {
    const dialogRef = this.dialog.open(ViewDocumentoComponent, {
      width: '60%',
      height: '95%',
      data: documentoSeleccionado,
    });
  }

  viewJustificacion(vidDecreto:any){
    const dialogRef = this.dialog.open(SustentacionComponent, {
      width: '60%',
      height: '95%',
      data: vidDecreto,
    });
  }

  buscarFechas(){
    if (this.range.value['start']!= null && this.range.value['end']!=null){
      this.cargando = true;
      this.documentoService.findArchivados1ByOrganizacion(sessionStorage.getItem(environment.codigoOrganizacion),
        environment.convertDateToStr(this.range.value['start']), environment.convertDateToStr(this.range.value['end'])).subscribe((data: any) => {
        this.createTable(data);
        this.cargando = false;
      }, (error: any)=> {
         this.cargando = false;
        Swal.fire('Lo sentimos', `Se presento un inconveniente en la consulta`, 'warning');
      });
    }else {
      Swal.fire('LO SENTIMOS', 'INGRESE RANGO DE FECHA', 'info');
    }
  }

  contexto: string = '';

  buscarPorContexto(contexto:any){
      this.cargando = true;
      // this.documentoService.findArchivadosByContexto(sessionStorage.getItem(environment.codigoOrganizacion),
      //   environment.convertDateToStr(this.range.value['start']),
      //   environment.convertDateToStr(this.range.value['end'])).subscribe((data: any) => {
      //   this.createTable(data);
      //   this.cargando = false;
      // }, (error: any)=> {
      //    this.cargando = false;
      //   Swal.fire('Lo sentimos', `Se presento un inconveniente en la consulta`, 'warning');
      // });
  }

  viewTimeline(vidDocumento: any){
    const dialogRef = this.dialog.open(TimelineComponent, {
      width: '60%',
      height: '95%',
      data: vidDocumento,
    });
  }


}
