import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MenuService } from 'src/app/_service/menu.service';

@Component({
  selector: 'app-view-menu',
  templateUrl: './view-menu.component.html',
  styleUrls: ['./view-menu.component.css']
})
export class ViewMenuComponent implements OnInit {
   displayedColumns: string[] = ['Codigo', 'Nombre', 'URL' ,'Acciones'];
    dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
    cargando: boolean= false;
  
    @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
  
  constructor(
    private menuServices: MenuService
  ) { }

  ngOnInit(): void {
    this.cargarMenu();
  }
  cargarMenu(){
    this.menuServices.listar().subscribe(
      {
        next:(response:any)=>{
          debugger;
          this.createTable(response);
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
