import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
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
  dataSource: MatTableDataSource<Correspondencia> = new MatTableDataSource<Correspondencia>();
  cargando: boolean;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

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
    this.correspondenciaService.searchByFechas().subscribe((response:any) => {
      if (response!= null)
        this.createTable(response.data);
      this.cargando = false;
    }, error => {
      this.cargando = false;
      Swal.fire('Lo sentimos', 'Se presento un inconveniente en cargar la información', 'info');
    });

  }

  buscarFechas(){
    if (this.range.value['start']!= null && this.range.value['end']!=null){
      this.cargando = true;
      this.correspondenciaService.searchByFechas(
        environment.convertDateToStr(this.range.value['start']),
         environment.convertDateToStr(this.range.value['end'])).subscribe((response: any) => {
        if (response!= null)
          this.createTable(response.data);
        this.cargando = false;
      }, (error: any)=> {
        this.cargando = false;
        Swal.fire('Lo sentimos', `Se presento un inconveniente en la consulta`, 'warning');
      });
    }else {
      Swal.fire('LO SENTIMOS', 'INGRESE RANGO DE FECHA', 'info');
    }
  }

  createTable(correspondencia: Correspondencia[]){
    this.dataSource.data = correspondencia;
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
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
