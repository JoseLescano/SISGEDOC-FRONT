import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Correspondencia } from 'src/app/_model/correspondencia';
import { CorrespondenciaService } from 'src/app/_service/correspondencia.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reporte-recojo-op',
  templateUrl: './reporte-recojo-op.component.html',
  styleUrls: ['./reporte-recojo-op.component.css']
})
export class ReporteRecojoOPComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['Nro', 'Asunto','Documento', 'Origen', 'Destino', 'Fecha Registro',  'Acciones'];
  dataSource: MatTableDataSource<Correspondencia>;
  cargando: boolean;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private correspondenciaService: CorrespondenciaService
  ) { }

  ngOnInit(): void {
    this.cargando = true;
    this.correspondenciaService.findByOrganizacionDestino(
      sessionStorage.getItem(environment.codigoOrganizacion)).subscribe(
      {
        next: (response:any) => {
          this.createTable(response.data);
          this.cargando = false;
        }, 
        error : (err: any) => {
          this.cargando = false;
          Swal.fire('LO SENTIMOS', 'SE PRESENTO UN INCONVENIENTE', 'info');
        }
      });
  }

  createTable(correspondencia: Correspondencia[]){
    this.dataSource = new MatTableDataSource(correspondencia);
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

}
