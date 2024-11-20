import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FacilitaService } from 'src/app/_service/facilita.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-pendientes',
  templateUrl: './list-pendientes.component.html',
  styleUrls: ['./list-pendientes.component.css']
})
export class ListPendientesComponent implements OnInit {

  displayedColumns: string[] = ['Id', 'Asunto',  'Documento', 'Remitente', 'Destino', 'Folio', 'CodigoFacilita', 'Acciones'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  cargando: boolean;

  constructor(private facilitaService: FacilitaService) { }

  ngOnInit(): void {
    this.getDocumentos();
  }

  showDiv = false;

  closeDiv(): void {
    this.showDiv = false;
  }

  getDocumentos(){
    this.facilitaService.getDocumentoPendientes()
    .subscribe(
      {
        next: (response: any)=> {
          if (response.length < 0) {
            Swal.fire('SIN RESULTADOS', 'No hay correspondencias disponibles', 'info');
          }else {
            this.createTable(response);
          }
        }, error: (err:any)=> {
          console.log(err);
          Swal.fire('AVISO', 'SE PRESENTO UN INCONVENIENTE', 'info');
        }
      }
    );
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  createTable(documentos: any[]) {
    this.dataSource.data = documentos;
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;


      this.dataSource.sortingDataAccessor = (item, property) => {
        switch(property) {
          case 'Id': return item.id;
          case 'Asunto': return item.asunto.toLowerCase();
          case 'Documento': return item.tipoDocumento;
          case 'Remitente': return item.remitente.toLowerCase();
          case 'Destino': return item.dependenciaDestino.toLowerCase();
          case 'Folio': return item.folio;
          case 'CodigoFacilita': return item.codigoFacilita.toLowerCase();
          // Añade más casos según tus columnas
          default: return item[property];
        }
      };
    });
  }

}
