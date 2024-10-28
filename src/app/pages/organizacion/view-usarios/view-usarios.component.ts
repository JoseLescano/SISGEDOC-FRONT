import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { switchMap } from 'rxjs';
import { OrganizacionDiagram } from 'src/app/_DTO/OrganizacionDiagram';
import { Organizacion } from 'src/app/_model/organizacion';
import { Perfil } from 'src/app/_model/perfil';
import { Persona } from 'src/app/_model/persona';
import { Rol } from 'src/app/_model/rol';
import { OrganizacionService } from 'src/app/_service/organizacion.service';
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
  puesto : string;
  rolSeleccionado: Rol;


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  cargando: boolean;

  constructor(
    private matDialog: MatDialogRef<ViewUsariosComponent>,
    private perfilService:PerfilService,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private personaService: PersonaService,
    private rolService: RoleService,
    private organizacionService: OrganizacionService
  ) { }

  ngOnInit(): void {
    this.organizacionService.findByCodigoInterno(this.data).pipe(switchMap((response:any)=> {
      this.organizacionSeleccionada = response.data;
      this.rolService.findForUsuario().subscribe((responseRoles:any)=>{
        this.roles = responseRoles;
      });
      return this.perfilService.findByOrganizacion(this.data);
    })).subscribe((responsePerfil:any)=> {
      this.createTable(responsePerfil);
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

  registrarPerfil(){
    if (this.validar()){
      this.perfilService.registrarPerfil(this.organizacionSeleccionada.codigoInterno, this.persona.usuario_CHASQUI,
        this.puesto, this.rolSeleccionado.codigo).subscribe((response:any)=> {
          if (response.data==0){
            Swal.fire('OPERACION REALIZADA', response.message, 'success');
            this.perfilService.findByOrganizacion(this.organizacionSeleccionada.codigoInterno).subscribe((response:any)=>{
              this.createTable(response);
            });
          }
          else {
            Swal.fire('LO SENTIMOS', response.message, 'info');
          }
        }, error => {
          Swal.fire('LO SENTIMOS', 'SE PRESENTO UN INCONVENIENTE', 'warning');
        });
    }
  }

  validar():boolean{
    var organizacion = this.organizacionSeleccionada != null && this.organizacionSeleccionada.codigoInterno != '';
    var puesto = this.puesto != null && this.puesto != '';
    var rol = this.rolSeleccionado != null && this.rolSeleccionado.codigo !='';
    var usuario = this.persona.usuario_CHASQUI != null && this.persona.usuario_CHASQUI != '';
    if (!organizacion || !puesto || !rol || !usuario){
      Swal.fire('Datos incompletos', `Complete todos los campos`, 'error');
      return false;
    } else {
      return true;
    }
  }

  seleccionarUsuario(perfilSeleccionado:Perfil){
    this.puesto = perfilSeleccionado.nombre;
    this.rolSeleccionado=perfilSeleccionado.rol;
    this.persona.usuario_CHASQUI = perfilSeleccionado.usuario.usuario_CHASQUI;
    this.organizacionSeleccionada.codigoInterno=perfilSeleccionado.organizacion.codigoInterno;
  }

  eliminar(codigo:any){
    Swal.fire({
      title: '¿Está seguro?',
      text: "No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, bórralo.'
    }).then((result) => {
      if (result.isConfirmed) {
        this.perfilService.eliminarPerfil(codigo).pipe(switchMap((response:any)=> {
          return this.perfilService.findByOrganizacion(this.data);
        })).subscribe((responsePerfil:any)=> {
          Swal.fire('ELIMINACIÓN CORRECTA', 'SE HA ELIIMINADO PERFIL DEL USUARIO CORRECTAMENTE', 'info');
          this.createTable(responsePerfil);
        });
      }
    })
  };

}
