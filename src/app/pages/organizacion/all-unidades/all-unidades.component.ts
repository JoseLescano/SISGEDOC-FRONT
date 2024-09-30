import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { OrganizacionDiagram } from 'src/app/_DTO/OrganizacionDiagram';

@Component({
  selector: 'app-all-unidades',
  templateUrl: './all-unidades.component.html',
  styleUrls: ['./all-unidades.component.css']
})
export class AllUnidadesComponent implements OnInit {

  tipoBusqueda:any = [
    {'id': 1, 'text':'TODOS'},
    {'id': 2, 'text':'INTERNAS'},
    {'id': 3, 'text':'EXTERNAS'},
    {'id': 4, 'text':'CORREO OLAYA'},
  ];

  displayedColumns: string[] = ['#', 'COD.INTERNO', 'ACRONIMO', 'NOMBRE-COMPLETO', 'ACCIONES'];
  dataSource: MatTableDataSource<OrganizacionDiagram>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor() { }

  ngOnInit(): void {
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

  createTable(organizacion: OrganizacionDiagram[]){
    this.dataSource = new MatTableDataSource(organizacion);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
  }


}
