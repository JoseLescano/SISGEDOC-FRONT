import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CorrespondenciaService } from 'src/app/_service/correspondencia.service';
import Swal from 'sweetalert2';
import { ValidarRecojoComponent } from '../validar-recojo/validar-recojo.component';
import { MatDialog } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { ReportCorrespondenciaComponent } from 'src/app/pages/report/report-correspondencia/report-correspondencia.component';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

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

  // Nuevas propiedades para el filtrado
  filterValue: string = '';
  private filterSubject = new Subject<string>();


  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  constructor(
    private correspondenciaService: CorrespondenciaService,
    public dialog: MatDialog,
  ) {
    // Configurar debounce para el filtro
    this.filterSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(searchValue => {
      this.filterValue = searchValue;
      this.pageIndex = 0; // Resetear a la primera página
      this.loadTable(this.pageIndex, this.pageSize);
    });
  }

  ngAfterViewInit() {
      this.sort.sortChange.subscribe((sort: Sort) => {
        this.pageIndex = 0;
        this.loadTable(sort.active, sort.direction);
      });
    }


  ngOnInit(): void {
    this.cargando = true;
    this.loadTable(this.pageIndex, this.pageSize);

  }

  loadTable(page:any, size:any, sortField: string = 'id', sortDirection: string = 'desc'){
    let fi='';
    let ff='';
    let codigoOrganizacion = sessionStorage.getItem(environment.codigoOrganizacion);
    if (this.range.value['start']!= null && this.range.value['end']!=null){
      fi = environment.convertDateToStr(this.range.value['start']);
      ff = environment.convertDateToStr(this.range.value['end']);
      this.correspondenciaService.searchByFechas(
      fi, ff, codigoOrganizacion,page, size, sortField, sortDirection, this.filterValue)
      .subscribe(
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
      this.correspondenciaService.searchByFechas('', '',
      codigoOrganizacion,page, size, sortField, sortDirection, this.filterValue )
      .subscribe(
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
    }

  }

 // Método para búsqueda por fechas
  buscarPorFechas() {
    this.pageIndex = 0;
    this.filterValue = ''; // Limpiar filtro de texto
    this.loadTable(this.pageIndex, this.pageSize);
  }

  createTable(correspondencias: any[]) {
    this.dataSource = new MatTableDataSource<any>();
    this.dataSource.data = correspondencias;
    // No usar filtro local, ya que filtramos desde el servidor
  }

  showMore(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    if (this.pageSize>20)
      this.loadTable(this.pageIndex, this.pageSize, 'id','desc');
    else this.loadTable(this.pageIndex, this.pageSize);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterSubject.next(filterValue.trim());
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
