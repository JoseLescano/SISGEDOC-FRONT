import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { OrganizacionDiagram } from 'src/app/_DTO/OrganizacionDiagram';
import { OrganizacionService } from 'src/app/_service/organizacion.service';
import { PerfilService } from 'src/app/_service/perfil.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  displayedColumns: string[] = [ 'Acronimo', 'Nombre completo', 'Cargo', 'Acciones'];
  dataSource: MatTableDataSource<OrganizacionDiagram>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  cargando: boolean;

  constructor(
    private organizacionService:OrganizacionService,
    private perfilService: PerfilService
  ) { }

  ngOnInit(): void {
    this.organizacionService.findForDiagrama(
      sessionStorage.getItem(environment.codigoOrganizacion))
    .subscribe(
      {
        next : (response: any)=> {
          this.createTable(response.data)
        },
        error: (err: any)=>{
          Swal.fire('AVISO', err.error, 'info');
        }
      }
    );
  }

   ngAfterViewInit() {
      setTimeout(() => {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
    }

    applyFilter(event: Event) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.dataSource.filter = filterValue.trim().toLowerCase();

    }

    imprimirListaPersonal(codigo:any, todo:any){
      this.perfilService.listPersonal(todo?sessionStorage.getItem(environment.codigoOrganizacion):codigo,todo).subscribe(
        {
          next: (data:any)=> {
            const blob = new Blob([data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'ListaPersona.pdf';
            a.click();
            window.URL.revokeObjectURL(url);
          },
          error:(err:any)=> {

          }
        }
      );
    }

    createTable(organizacion: OrganizacionDiagram[]){
      this.dataSource = new MatTableDataSource(organizacion);
      setTimeout(() => {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
    }

}
