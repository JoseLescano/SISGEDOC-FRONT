import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { OrganizacionDiagram } from 'src/app/_DTO/OrganizacionDiagram';
import { Organizacion } from 'src/app/_model/organizacion';
import { OrganizacionService } from 'src/app/_service/organizacion.service';

@Component({
  selector: 'app-traslado-uu',
  templateUrl: './traslado-uu.component.html',
  styleUrls: ['./traslado-uu.component.css']
})
export class TrasladoUUComponent implements OnInit {

  displayedColumns: string[] = ['codigoInterno', 'acronimo'];
  dataSource: MatTableDataSource<OrganizacionDiagram>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  organizacionesOrigen: OrganizacionDiagram[];
  unidadOrigen: OrganizacionDiagram = new OrganizacionDiagram();
  unidadDestino: OrganizacionDiagram = new OrganizacionDiagram();
  codigoOrigen: string;
  codigoDestino: string;

  constructor(
    private organizacionService: OrganizacionService
  ) { }

  ngOnInit(): void {
    this.getInfo('0211', '12');

  }

  getInfo(organizacionOrigen:string, organziacionDestino: string){
    this.organizacionService.getInfo(organizacionOrigen, organziacionDestino)
    .subscribe(
      {
        next : (response: any)=> {
          console.log(response);
          this.organizacionesOrigen = response.data.OrganizacionesHijas;
          this.unidadOrigen = response.data.organizacionOrigen;
          this.unidadDestino = response.data.organizacionDestino;
          this.createTable(response.data.organizacionesHijas)
        },
        error : (err:any) => {

        }
      }
    );
  }

  createTable(organizacion: OrganizacionDiagram[]){
    debugger
    this.dataSource = new MatTableDataSource(organizacion);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
