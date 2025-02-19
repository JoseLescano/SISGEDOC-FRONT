import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ClaseService } from 'src/app/_service/clase.service';

@Component({
  selector: 'app-view-clases',
  templateUrl: './view-clases.component.html',
  styleUrls: ['./view-clases.component.css']
})
export class ViewClasesComponent implements OnInit {
  displayedColumns: string[] = ['Codigo', 'Nombre', 'Acronimo' ,'Acciones'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  cargando: boolean= false;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private claseServices: ClaseService
  ) { }

  ngOnInit(): void {
    this.cargarClase();
  }
  cargarClase(){
    this.claseServices.listar().subscribe(
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
