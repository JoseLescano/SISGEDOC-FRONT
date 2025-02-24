import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RoleService } from 'src/app/_service/role.service';

@Component({
  selector: 'app-view-roles',
  templateUrl: './view-roles.component.html',
  styleUrls: ['./view-roles.component.css']
})
export class ViewRolesComponent implements OnInit {
  displayedColumns: string[] = ['Codigo', 'Nombre','Acciones'];
      dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
      cargando: boolean= false;

      @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
      @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private roleServices: RoleService
  ) { }

  ngOnInit(): void {
    this.cargarMenu();
  }
  cargarMenu(){
    this.roleServices.listar().subscribe(
      {
        next:(response:any)=>{
          debugger;
          this.createTable(response);
        },
        error:(er:any)=>{
          console.log(er)
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
