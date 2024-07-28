import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Documento } from 'src/app/_model/documento.model';
import { DocumentoService } from 'src/app/_service/documento.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { ViewDocumentoComponent } from '../view-documento/view-documento.component';
import { SeguimientoComponent } from '../../report/seguimiento/seguimiento.component';
import { FormGroup, FormControl } from '@angular/forms';
import { ExcelService } from 'src/app/_service/excel.service';
import { TimelineComponent } from '../../report/timeline/timeline.component';

@Component({
  selector: 'app-view-remitidos',
  templateUrl: './view-remitidos.component.html',
  styleUrls: ['./view-remitidos.component.css']
})
export class ViewRemitidosComponent implements OnInit {

  displayedColumns: string[] = ['Nro', 'Asunto', 'Origen','Destino', 'FechaDoc', 'Documento',  'Acciones'];
  dataSource: MatTableDataSource<any>;
  cargando: boolean= false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });


  // =======================================================================================================

  constructor(
    private documentoService: DocumentoService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private excelService: ExcelService
  ) { }

  // =======================================================================================================

  ngOnInit(): void {

    this.route.paramMap.subscribe((params: ParamMap) => {
      this.generarReporte();
    });
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

  generarReporte(fi?:any, ff?:any): void {
    this.cargando = true;
    this.documentoService.findRemitidos(sessionStorage.getItem(environment.codigoOrganizacion), fi, ff).subscribe( {
      next : (data: any) => {
        this.createTable(data);
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
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

  }

  ngAfterViewInit() {
    this.dataSource = null;
    if (this.dataSource!= null){
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  verDocumento(documentoSeleccionado?:any): void {
    const dialogRef = this.dialog.open(ViewDocumentoComponent, {
      width: '60%',
      height: '95%',
      data: documentoSeleccionado,
    });
  }

  VerRespuesta(codigoPadre?:any): void {
    debugger;
    let documento : Documento = new Documento();
    this.documentoService.findRespuestaByVidParent(codigoPadre).subscribe((data:any)=> {
      debugger;
      documento = {...data}
      const dialogRef = this.dialog.open(ViewDocumentoComponent, {
        width: '60%',
        height: '95%',
        data: documento,
      });
    })


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
      this.generarReporte(environment.convertDateToStr(this.range.value['start']), environment.convertDateToStr(this.range.value['end']));
    }else {
      Swal.fire('LO SENTIMOS', 'INGRESE RANGO DE FECHA', 'info');
    }
  }

}
