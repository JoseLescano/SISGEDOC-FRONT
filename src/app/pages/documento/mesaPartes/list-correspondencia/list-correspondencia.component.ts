import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Correspondencia } from 'src/app/_model/correspondencia';
import { CorrespondenciaService } from 'src/app/_service/correspondencia.service';
import Swal from 'sweetalert2';
import { ValidarRecojoComponent } from '../validar-recojo/validar-recojo.component';
import { MatDialog } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { ReportCorrespondenciaComponent } from 'src/app/pages/report/report-correspondencia/report-correspondencia.component';

@Component({
  selector: 'app-list-correspondencia',
  templateUrl: './list-correspondencia.component.html',
  styleUrls: ['./list-correspondencia.component.css']
})
export class ListCorrespondenciaComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['Estado', 'Nro', 'Asunto','Documento', 'Origen', 'Destino', 'Fecha Registro', 'Folio',  'Acciones'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  cargando: boolean;

  pageSize = 20;
  pageIndex = 0;
  totalElements: number = 0;


  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  constructor(
    private correspondenciaService: CorrespondenciaService,
    public dialog: MatDialog,
  ) { }


  ngOnInit(): void {
    this.cargando = true;
    this.loadTable(0,20);

  }

  loadTable(page:any, size:any, sortField: string = 'id', sortDirection: string = 'desc'){
    let fi='';
    let ff='';
    let codigoOrganizacion = sessionStorage.getItem(environment.codigoOrganizacion);
    if (this.range.value['start']!= null && this.range.value['end']!=null){
      fi = environment.convertDateToStr(this.range.value['start']);
      ff = environment.convertDateToStr(this.range.value['end']);
      this.correspondenciaService.searchByFechas(codigoOrganizacion,page, size, sortField, sortDirection,
        environment.convertDateToStr(this.range.value['start']),
         environment.convertDateToStr(this.range.value['end'])).subscribe(
          {
            next : (data: any) => {
            this.totalElements = data.totalElements;
            this.createTable(data.content);
            this.cargando = false;
            }, error: err => {
            this.cargando = false;
            Swal.fire('Lo sentimos', err, 'warning');
            }
          }
         );
    } else {
      this.correspondenciaService.searchByFechas(
      codigoOrganizacion,page, size, sortField, sortDirection )
      .subscribe(
        {
          next : (data: any) => {
          this.totalElements = data.totalElements;
          debugger
          this.createTable(data.content);
          this.cargando = false;
          }, error: err => {
          this.cargando = false;
          Swal.fire('Lo sentimos', err, 'warning');
          }
        }
      );
    }

  }

  buscarFechas(){
    if (this.range.value['start']!= null && this.range.value['end']!=null){
      this.cargando = true;
      this.loadTable(0,20);
    }else {
      Swal.fire('LO SENTIMOS', 'INGRESE RANGO DE FECHA', 'info');
    }
  }

  createTable(correspondencia: Correspondencia[]){
    this.dataSource = new MatTableDataSource<any>();
    this.dataSource.data = correspondencia;
    setTimeout(() => {
      this.dataSource.sort = this.sort;
      this.dataSource.sortingDataAccessor = (item, property) => {
        debugger
      switch(property) {
        case 'Nro': return item.id;
        case 'Asunto': return item.asunto.toLowerCase();
        case 'Fecha Registro': return item.fechaRegistro;
        case 'Documento': return item.documento;
        case 'Origen': return item.organizacionOrigen.toLowerCase();
        case 'Destino': return item.organizacionDestino.toLowerCase();
        case 'Estado': return item.estado.toLowerCase();
        // Añade más casos según tus columnas
        default: return item[property];
      }
      };
    });
  }

  showMore(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    if (this.pageSize>20)
      this.loadTable(0, this.pageSize, 'id','desc');
    else this.loadTable(this.pageIndex, this.pageSize);
}

  ngAfterViewInit() {
    this.sort.sortChange.subscribe((sort: Sort) => {
      this.pageIndex = 0; // Reinicia a la primera página si cambia el orden
      this.loadTable(this.pageIndex, this.pageSize, sort.active, sort.direction);
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

  }

  _window(): any {
    // return the global native browser window object
    return window;
  }

  abrirValidarCredenciales(informacion:any): void {
    let sendData : any = {
      data: informacion,
      tipoOperacion: 2
    }
    const dialogRef = this.dialog.open(ValidarRecojoComponent,{
      width: '40%',
      data: sendData
    });

  }

  eliminar(correspondencia:any){
    Swal.fire({
      title: "¿ESTÁS SEGURO?",
      text: "LA CORRESPONDENCIA SERÁ ELIMINADA, ¿DESEAS CONTINUAR?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "SÍ, DESEO CONTINUAR"
    }).then((result) => {
      if (result.isConfirmed) {
        this.abrirValidarCredenciales(correspondencia);
      }
	  }
	 );
  }

  viewSeguimiento(codigo?:any): void {
    const dialogRef = this.dialog.open(ReportCorrespondenciaComponent, {
      width: '60%',
      height: '95%',
      data: codigo,
    });
  }

}
