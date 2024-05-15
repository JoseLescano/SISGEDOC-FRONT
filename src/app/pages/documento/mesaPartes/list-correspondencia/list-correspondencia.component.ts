import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Correspondencia } from 'src/app/_model/correspondencia';
import { CorrespondenciaService } from 'src/app/_service/correspondencia.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-correspondencia',
  templateUrl: './list-correspondencia.component.html',
  styleUrls: ['./list-correspondencia.component.css']
})
export class ListCorrespondenciaComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['Nro', 'Asunto','Documento', 'Origen', 'Destino', 'Fecha Registro',  'Acciones'];
  dataSource: MatTableDataSource<Correspondencia>;
  cargando: boolean;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  constructor(
    private correspondenciaService: CorrespondenciaService
  ) { }


  ngOnInit(): void {
    this.cargando = true;
    this.correspondenciaService.listar().subscribe((response:any) => {
      this.createTable(response.data);
      this.cargando = false;
    }, error => {
      this.cargando = false;
      Swal.fire('Lo sentimos', 'Se presento un inconveniente en cargar la información', 'info');
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
