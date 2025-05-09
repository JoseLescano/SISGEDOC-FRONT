import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { OrganizacionDiagram } from 'src/app/_DTO/OrganizacionDiagram';
import { OrganizacionService } from 'src/app/_service/organizacion.service';
import { PerfilService } from 'src/app/_service/perfil.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-all-unidades',
  templateUrl: './all-unidades.component.html',
  styleUrls: ['./all-unidades.component.css']
})
export class AllUnidadesComponent implements OnInit, AfterViewInit {

  tipoBusqueda:any = [
    {'id': 1, 'text':'CODIGO'},
    {'id': 2, 'text':'INTERNAS'},
    {'id': 3, 'text':'EXTERNAS'},
    {'id': 4, 'text':'DEPENDENCIAS'},
  ];

  itemSeleccionado: number= 0;
  mostrarInput:boolean = true;

  displayedColumns: string[] = ['#', 'COD.INTERNO', 'ACRONIMO', 'NOMBRE-COMPLETO', 'ACCIONES'];
  dataSource: MatTableDataSource<OrganizacionDiagram>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private organizacionService: OrganizacionService,
     private perfilService:PerfilService,
  ) { }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;
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
    debugger
    this.dataSource = null;
    if (this.itemSeleccionado ===1 )this.mostrarInput = true;
    if (this.itemSeleccionado===2){
      this.organizacionService.getInternos().subscribe(
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
    if (this.itemSeleccionado===3){
      this.organizacionService.getAllExternas().subscribe(
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
    if(this.itemSeleccionado === 4){
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

  imprimirListaPersonal(codigo:any, todo:any, acronimo:any){
    this.perfilService.listPersonal(todo?sessionStorage.getItem(environment.codigoOrganizacion):codigo,todo)
    .subscribe(
      {
        next: (data:any)=> {
          const blob = new Blob([data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'ListaPersona ' + acronimo + '.pdf';
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error:(err:any)=> {

        }
      }
    );
  }


}
