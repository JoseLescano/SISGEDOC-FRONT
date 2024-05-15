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

@Component({
  selector: 'app-entregar-correspondencia',
  templateUrl: './entregar-correspondencia.component.html',
  styleUrls: ['./entregar-correspondencia.component.css']
})
export class EntregarCorrespondenciaComponent implements OnInit {

  displayedColumns: string[] = ['select', 'Nro', 'Asunto','Documento', 'Origen', 'Destino', 'Fecha Registro',  'Acciones'];
  dataSource: MatTableDataSource<Correspondencia>;
  cargando: boolean;
  remitentes:Organizacion[] = [];
  form:FormGroup;

  selection = new SelectionModel<Correspondencia>(true, []);

  constructor(
    private organizacionService:OrganizacionService,
    private correspondenciaService: CorrespondenciaService
  ) { }

  ngOnInit(): void {
    this.cargando = true;
    this.organizacionService.getWithCodigoCopere().subscribe((response:any)=>{
      this.remitentes = response.data as Organizacion[];
    });
    this.initForm();
    this.cargando = false;
  }

  initForm(){
    this.form = new FormGroup({
      'destino': new FormControl('', [Validators.required]),
      'lista-correspondencia': new FormControl([], [Validators.required])
    })
    //this.form.controls['lista-correspondencia'].setValue(this.selection.selected);
    //selection
  }

  buscarCorrespondencia(idOrganizacion: any){
    this.cargando = true;
    this.correspondenciaService.listEntregarByOP(idOrganizacion).subscribe((response:any)=> {
      if (response != null)
        this.createTable(response.data);
      else {
        this.form.reset();
        Swal.fire('Sin resultados', 'No se encuentra correspondencia para unidad seleccionada', 'info');
      }
      this.cargando = false;
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
    console.log(this.selection);
  }

  createTable(correspondencia: Correspondencia[]){
    this.dataSource = new MatTableDataSource(correspondencia);
  }

  // ngAfterViewInit() {
  //   this.dataSource.paginator = this.paginator;
  //   this.dataSource.sort = this.sort;
  // }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  operate(){

  }

}
