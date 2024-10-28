import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
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
export class EntregarCorrespondenciaComponent implements OnInit {

  displayedColumns: string[] = ['select', 'Nro', 'Asunto','Documento', 'Origen', 'Destino', 'Fecha Registro', 'Folio'];
  dataSource: MatTableDataSource<Correspondencia>;
  cargando: boolean;
  remitentes:Organizacion[] = [];
  form:FormGroup;
  lista:any;

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
    if (this.codigoOrganizacion == '120210' ||  this.codigoOrganizacion == '12021001' || this.codigoOrganizacion == '12021002'){
      this.cargando = true;
      this.organizacionService.getWithCodigoCopere().subscribe((response:any)=>{
        this.remitentes = response.data as Organizacion[];
      });
      this.cargando = false;
    } else {
      this.router.navigate(['/principal/dashboard']);
      Swal.fire('LO SENTIMOS', 'USTED NO CUENTA CON LOS PERMISOS CORRESPONDIENTES', 'info');
    }
  }

  buscarCorrespondencia(idOrganizacion: any){
    this.cargando = true;
    this.dataSource = new MatTableDataSource<Correspondencia>;
    this.correspondenciaService.listEntregarByOP(idOrganizacion).subscribe((response:any)=> {
      this.destino = idOrganizacion;
      if (response != null){
        this.cargando = false;
        this.createTable(response.data);
      } else {
        this.cargando = false;
        Swal.fire('SIN RESULTADOS', 'UNIDAD SIN CORRESPONDENCIA REGISTRADA', 'info');
      }
    }, error => {
      Swal.fire('Lo sentimos', 'Se presento un inconveniente en la busqueda', 'info');
    });
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

  agregar(){
    // this.selection.selected
  }

  createTable(correspondencia: Correspondencia[]){
    this.dataSource = new MatTableDataSource(correspondencia);
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
