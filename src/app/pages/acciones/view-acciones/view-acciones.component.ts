
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AccionService } from 'src/app/_service/accion.service';
@Component({
  selector: 'app-view-acciones',
  templateUrl: './view-acciones.component.html',
  styleUrls: ['./view-acciones.component.css']
})
export class ViewAccionesComponent implements OnInit {

   displayedColumns: string[] = ['Codigo', 'Descripcion', 'Acciones'];
    dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
    cargando: boolean= false;

    @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;


  constructor(
    private accionesServices: AccionService
  ) { }


ngOnInit(): void {
this.cargarAcciones();
  }

  cargarAcciones(){
    this.accionesServices.listar().subscribe(
      {
        next:(response:any)=>{
          debugger;
          this.createTable(response.data);
        },
        error:(er:any)=>{

        }
      }
    );
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

}
