import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatStepper } from '@angular/material/stepper';
import { MatTableDataSource } from '@angular/material/table';
import { Organizacion } from 'src/app/_model/organizacion';
import { FacilitaService } from 'src/app/_service/facilita.service';
import { OrganizacionService } from 'src/app/_service/organizacion.service';
import { PrioridadService } from 'src/app/_service/prioridad.service';
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
  @ViewChild('stepper') stepper!: MatStepper; // Referencia al MatStepper

  cargando: boolean = false;
  destinos :Organizacion[] = [];
  urlArchivo: string = '';
  documento: any = '';
  prioridades : any = [];

  constructor(
    private facilitaService: FacilitaService,
    private _formBuilder: FormBuilder,
    private organizacionService: OrganizacionService,
    private prioridadService: PrioridadService
  ) {}

  ngOnInit(): void {
    this.getDocumentos();
  }

  files: any[]  = [];

  getDocumentos(){
    this.cargando = true;
    this.facilitaService.getDocumentoPendientes()
    .subscribe(
      {
        next: (response: any)=> {
          if (response.length < 0) {
            Swal.fire('SIN RESULTADOS', 'No hay correspondencias disponibles', 'info');
          }else {
            this.cargando = false;
            this.createTable(response);
          }
        }, error: (err:any)=> {
          console.log(err);
          this.cargando = false;
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
    debugger;
    this.dataSource.data = documentos;
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      this.dataSource.sortingDataAccessor = (item, property) => {
        switch(property) {
          case 'Id': return item.id;
          case 'Asunto': return item.asunto.toLowerCase();
          case 'CodigoFacilita': return item.codigoFacilita;
          case 'DependenciaDestino': return item.dependenciaDestino.toLowerCase();
          case 'FechaCreacion': return item.fechaCreacion;
          case 'Remitente': return item.remitente.toLowerCase();
          case 'Documento': return item.tipoDocumento.toLowerCase();
          // Añade más casos según tus columnas
          default: return item[property];
        }
      };
    })

  }

}
