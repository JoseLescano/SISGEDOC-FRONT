import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { OrganizacionDiagram } from 'src/app/_DTO/OrganizacionDiagram';
import { Organizacion } from 'src/app/_model/organizacion';
import { Perfil } from 'src/app/_model/perfil';
import { Persona } from 'src/app/_model/persona';
import { Rol } from 'src/app/_model/rol';
import { PerfilService } from 'src/app/_service/perfil.service';
import { PersonaService } from 'src/app/_service/persona.service';
import { RoleService } from 'src/app/_service/role.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-usarios',
  templateUrl: './view-usarios.component.html',
  styleUrls: ['./view-usarios.component.css']
})
export class ViewUsariosComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['Rol', 'Puesto', 'Responsable', 'Acciones'];
  dataSource: MatTableDataSource<Perfil>;
  organizacionSeleccionada: Organizacion = new Organizacion();
  roles: Rol[] = [];
  campoIngresado: any = '';
  persona: Persona = new Persona();
  nombreCompleado: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  cargando: boolean;

  constructor(
    private matDialog: MatDialogRef<ViewUsariosComponent>,
    private perfilService:PerfilService,
    @Inject(MAT_DIALOG_DATA) private data: Organizacion,
    private personaService: PersonaService,
    private rolService: RoleService
  ) { }

  ngOnInit(): void {
    this.organizacionSeleccionada = {...this.data};
    this.perfilService.findByOrganizacion(this.data.codigoInterno).subscribe((response:any)=> {
      this.createTable(response);
    });
    this.rolService.findForUsuario().subscribe((response:any)=>{
      this.roles = response;
    });
  }

  buscarPersona(campo:any){
    this.cargando = true;
    this.personaService.findByCampo(this.campoIngresado).subscribe((data:any)=>{
      this.persona = data;
      this.nombreCompleado = this.persona.grado_LARGA + ' '+ this.persona.arma_LARGA + ' '+  this.persona.apellidos+  ' ' + this.persona.nombres;
      this.cargando=false;
    }, (error: any)=> {
      this.persona = null;
      this.cargando=false;
      Swal.fire('Sin resultados', `No se encuentra información`, 'info');
    })
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  createTable(Perfil: Perfil[]){
    this.dataSource = new MatTableDataSource(Perfil);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
  }

  close(){
    this.matDialog.close();
  }

}
