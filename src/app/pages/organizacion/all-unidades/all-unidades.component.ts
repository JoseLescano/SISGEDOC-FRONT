import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { OrganizacionDiagram } from 'src/app/_DTO/OrganizacionDiagram';
import { OrganizacionService } from 'src/app/_service/organizacion.service';

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

  itemSeleccionado: number= 0;

  displayedColumns: string[] = ['#', 'COD.INTERNO', 'ACRONIMO', 'NOMBRE-COMPLETO', 'ACCIONES'];
  dataSource: MatTableDataSource<OrganizacionDiagram>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private organizacionService: OrganizacionService
  ) { }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  createTable(organizacion: OrganizacionDiagram[]){
    this.dataSource = new MatTableDataSource(organizacion);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
  }

  searchOrganizacion(){
    this.dataSource = null;
    if(this.itemSeleccionado ===4){
      this.organizacionService.getWithCodigoCopere().subscribe(
        {
          next: (response: any)=> {
            this.createTable(response.data);
          },
          error : (err: any)=> {
            console.log('error => ' + err)
          }
        }
      )
    }
  }


}
