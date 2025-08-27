import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { OrganizacionService } from 'src/app/_service/organizacion.service';
import { PerfilService } from 'src/app/_service/perfil.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

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
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  cargando: boolean;

  pageSize = 20;
  pageIndex = 0;
  totalElements: number = 0;


  constructor(
    private organizacionService: OrganizacionService,
    private perfilService:PerfilService,
  ) { }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe((sort: Sort) => {
      this.pageIndex = 0; // Reinicia a la primera página si cambia el orden
      this.loadTable(this.pageIndex, this.pageSize, sort.active, sort.direction);
    });
  }

  loadTable(page:any, size:any, sortField: string = 'codigoInterno', sortDirection: string = 'desc'){
    if(this.itemSeleccionado === 4){
      this.organizacionService.getEmu(page, size, sortField, sortDirection)
      .subscribe(
        {
          next: (response: any)=> {
            this.totalElements = response.totalElements;
            this.createTable(response.content);
          },
          error : (err: any)=> {
            console.log('error => ' + err)
          }
        }
      )
    }
  }

  showMore(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    if (this.pageSize>20)
      this.loadTable(this.pageIndex, this.pageSize, 'codigoInterno','desc');
    else this.loadTable(this.pageIndex, this.pageSize);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  createTable(organizaciones: any[]){
    this.dataSource = new MatTableDataSource<any>();
	  this.dataSource.data = organizaciones;
    this.dataSource.sort = this.sort;
  }

  searchOrganizacion(){
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

  desactivarEMU(codigoInterno:any){
    Swal.fire(
      {
        title: "¿ESTÁS SEGURO?",
        text: "LA UNIDAD SERÁ DESACTIVADA COMO DEPENDENCIA, ¿DESEAS CONTINUAR?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "SÍ, DESEO CONTINUAR"
      }
    ).then((result) =>
      {
        if (result.isConfirmed) {
          console.log('ACEPTO')
        }
      }
    );
  }


}
