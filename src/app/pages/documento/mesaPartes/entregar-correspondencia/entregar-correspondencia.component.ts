import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Correspondencia } from 'src/app/_model/correspondencia';
import { Organizacion } from 'src/app/_model/organizacion';
import { CorrespondenciaService } from 'src/app/_service/correspondencia.service';
import { OrganizacionService } from 'src/app/_service/organizacion.service';

import {SelectionModel} from '@angular/cdk/collections'
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { ValidarRecojoComponent } from '../validar-recojo/validar-recojo.component';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-entregar-correspondencia',
  templateUrl: './entregar-correspondencia.component.html',
  styleUrls: ['./entregar-correspondencia.component.css']
})
export class EntregarCorrespondenciaComponent implements OnInit,AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns: string[] = ['select', 'Nro', 'Asunto','Documento', 'Origen', 'Destino', 'Fecha Registro', 'Folio'];
  dataSource: MatTableDataSource<Correspondencia> = new MatTableDataSource<any>();
  cargando: boolean;
  remitentes:Organizacion[] = [];

  form:FormGroup;

  // Paginación
  totalElements = 0;
  pageSize = 20;
  pageIndex = 0;

  destino : any;
  selection = new SelectionModel<Correspondencia>(true, []);

  codigoOrganizacion : any = sessionStorage.getItem(environment.codigoOrganizacion);

  constructor(
    private organizacionService:OrganizacionService,
    private correspondenciaService: CorrespondenciaService,
    public dialog: MatDialog,
    private router : Router
  ) { }

  ngOnInit(): void {
    if (['120210', '12021001', '12021002', '02'].includes(this.codigoOrganizacion)) {
      this.cargarRemitentes();
    } else {
      this.router.navigate(['/principal/dashboard']);
      Swal.fire('LO SENTIMOS', 'USTED NO CUENTA CON LOS PERMISOS CORRESPONDIENTES', 'info');
    }
  }

  ngAfterViewInit(): void {
    // Se asocia el paginador cuando el componente ya está renderizado
    this.dataSource.paginator = this.paginator;
  }

  cargarRemitentes() {
    this.cargando = true;
    const service = this.codigoOrganizacion === '02'
      ? this.organizacionService.getEntregarCopere()
      : this.organizacionService.getWithCodigoCopere();

    service.subscribe({
      next: (response: any) => {
        this.remitentes = response.data;
        this.cargando = false;
      },
      error: () => this.cargando = false
    });
  }

  buscarCorrespondencia(idOrganizacion: any, page:any, size:any, sortField: string = 'codigo', sortDirection: string = 'desc') {
    this.destino = idOrganizacion;
    this.correspondenciaService.listEntregarByOP(idOrganizacion, this.codigoOrganizacion, page, size, 'codigo', 'desc')
      .subscribe({
        next: (response: any) => {
          this.cargando = false;
          if (response.data.totalElements>0){
            this.dataSource = new MatTableDataSource<any>();
            this.dataSource.data = response.data.content;
            this.totalElements = response.data.totalElements;
          }else {
            this.dataSource.data = null;
            this.totalElements = 0;
            Swal.fire('AVISO', 'UNIDAD SIN CORRESPONDENCIA RESGISTRADA', 'info');
          }
        },
        error: (err: any) => {
          this.cargando = false;
          Swal.fire('Error', 'No se pudo obtener la correspondencia', 'error');
        }
      });
  }

  onPaginateChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    if (this.pageSize>20)
      this.buscarCorrespondencia(this.destino, this.pageIndex, this.pageSize, 'codigo','desc');
    else this.buscarCorrespondencia(this.destino, this.pageIndex, this.pageSize);
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Correspondencia): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.codigo + 1}`;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  abrirValidarCredenciales(informacion:any): void {
    let sendData : any = {
      data: informacion,
      tipoOperacion: 0
    }
    const dialogRef = this.dialog.open(ValidarRecojoComponent,{
      width: '40%',
      data: sendData
    });

  }

  operate(){
    let listaCorrespondenciaSeleccionada = this.selection.selected;
    let destino = this.destino;
    let informacion = {
      lista: listaCorrespondenciaSeleccionada,
      destino: destino
    }
    if (listaCorrespondenciaSeleccionada.length==0 || listaCorrespondenciaSeleccionada==null){
      Swal.fire('Lo sentimos', 'DEBE SELECCIONAR CORRESPONDENCIA A ENTREGAR', 'warning');
    }else {
      this.abrirValidarCredenciales(informacion);
      // Swal.fire('OPERACION REALIZADA', 'SE ENTREGO CORRESPONDENCIA!', 'success');
    }
  }

}
