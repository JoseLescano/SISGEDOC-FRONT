import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
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

  // Nuevas propiedades para el filtrado
  filterValue: string = '';
  private filterSubject = new Subject<string>();


  constructor(
    private organizacionService: OrganizacionService,
    private perfilService:PerfilService,
  ) {
    // Configurar debounce para el filtro (esperar 500ms después de que el usuario deje de escribir)
    this.filterSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(searchValue => {
      this.filterValue = searchValue;
      this.pageIndex = 0; // Resetear a la primera página cuando se filtre
      this.loadTable(this.pageIndex, this.pageSize);
    });
   }

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
      // Pasar el filtro al servicio
      this.organizacionService.getEmu(page, size, sortField, sortDirection, this.filterValue)
      .subscribe(
        {
          next: (response: any)=> {
            this.totalElements = response.totalElements;
            this.createTable(response.content);
            this.cargando = false;
          },
          error : (err: any)=> {
            console.log('error => ' + err);
            this.cargando = false;
          }
        }
      )
    }
  }

  showMore(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTable(this.pageIndex, this.pageSize);
  }

  // Método modificado para filtrado del servidor
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    // Usar el Subject para implementar debounce
    this.filterSubject.next(filterValue.trim());
  }

  createTable(organizaciones: any[]){
    this.dataSource = new MatTableDataSource<any>();
    this.dataSource.data = organizaciones;
  }

  searchOrganizacion(){
    this.dataSource = null;
    this.filterValue = ''; // Limpiar filtro cuando cambie el tipo de búsqueda

    if (this.itemSeleccionado === 1) {
      this.mostrarInput = true;
    }
    if (this.itemSeleccionado === 2) {
      this.loadTable(0, this.pageSize); // Usar loadTable en lugar de llamada directa
    }
    if (this.itemSeleccionado === 3) {
      this.loadTable(0, this.pageSize); // Usar loadTable en lugar de llamada directa
    }
    if (this.itemSeleccionado === 4) {
      this.loadTable(0, this.pageSize);
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

  addPerfil(codigoOrganizacion:any, codigoRol:any){
    this.perfilService.registrarPerfilSA(codigoOrganizacion,  codigoRol).subscribe(
      {
        next: (response: any)=> {
          Swal.fire('OPERACION REALIZADA', response.message, 'success');
        }, error: (err: any)=> {
          Swal.fire('AVISO', err.message, 'warning');
        }
      }
    );
  }


}
