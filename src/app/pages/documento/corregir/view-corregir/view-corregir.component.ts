import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Documento } from 'src/app/_model/documento.model';
import { DocumentoService } from 'src/app/_service/documento.service';
import { ExcelService } from 'src/app/_service/excel.service';
import { SeguimientoComponent } from 'src/app/pages/report/seguimiento/seguimiento.component';
import { TimelineComponent } from 'src/app/pages/report/timeline/timeline.component';
import { ViewDocumentoComponent } from '../../view-documento/view-documento.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { FormCorregirComponent } from '../form-corregir/form-corregir.component';

@Component({
  selector: 'app-view-corregir',
  templateUrl: './view-corregir.component.html',
  styleUrls: ['./view-corregir.component.css']
})
export class ViewCorregirComponent implements OnInit, AfterViewInit {

  cargando: boolean = false;

  displayedColumns: string[] = ['Nro', 'Asunto', 'Documento', 'Origen', 'FechaDoc.', 'Destinatario', 'Acciones'];
  dataSource: MatTableDataSource<Documento>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private excelService: ExcelService,
    private documentoService: DocumentoService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.cargando = true;

    this.documentoService.getDocumentoCambio().subscribe(data=> {
      this.createTable(data);
      this.cargando = false;
    }, error=> {
      this.cargando=false;
      Swal.fire('Lo sentimos', `Se presento un inconveniente en la consulta`, 'warning');
    });

    this.documentoService.findForCorregir(sessionStorage.getItem(environment.codigoOrganizacion)).subscribe((data: any)=> {
      this.createTable(data);
      this.cargando = false;
    }, error=> {
      this.cargando=false;
      Swal.fire('Lo sentimos', `Se presento un inconveniente en la consulta`, 'warning');
    });
  }


  exportTable() {
    this.excelService.exportTableToExcel('tbDecretados', 'LISTA DE DOCUMENTOS DECRETADOS');
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

  createTable(documento: Documento[]){
    this.dataSource = new MatTableDataSource(documento);
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  viewTimeline(vidDocumento: any){
    const dialogRef = this.dialog.open(TimelineComponent, {
      width: '60%',
      height: '95%',
      data: vidDocumento,
    });
  }

  openDialog(documentoSeleccionado?:any): void {
    let documento: Documento = new Documento();
    documento.codigo = documentoSeleccionado;
    const dialogRef = this.dialog.open(ViewDocumentoComponent, {
      width: '60%',
      height: '95%',
      data: documento,
    });
  }

  openCorregir(documentoSeleccionado:any, idDecreto: any): void {

    let data : any = {
      documento: documentoSeleccionado,
      decreto: idDecreto
    }
    const dialogRef = this.dialog.open(FormCorregirComponent, {
      width: '80%',
      data: data,
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
