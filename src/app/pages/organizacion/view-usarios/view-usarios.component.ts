import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
  nombreCompleado: string = '';
  form: FormGroup;


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  cargando: boolean;

  constructor(
    private matDialog: MatDialogRef<ViewUsariosComponent>,
    private perfilService: PerfilService,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private personaService: PersonaService,
    private rolService: RoleService,
    private organizacionService: OrganizacionService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.organizacionService.findByCodigoInterno(this.data).pipe(switchMap((response: any) => {
      this.organizacionSeleccionada = response.data;
      this.form.get('codigoOrganizacion').setValue(this.organizacionSeleccionada.codigoInterno);
      this.rolService.findForUsuario().subscribe((responseRoles: any) => {
        this.roles = responseRoles;
      });
      return this.perfilService.findByOrganizacion(this.data);
    })).subscribe((responsePerfil: any) => {
      this.createTable(responsePerfil);
    });

  }

  initForm() {
    this.form = new FormGroup({
      'codigo': new FormControl(0),
      'codigoOrganizacion': new FormControl('', [Validators.required]),
      'nroDocumento': new FormControl(''),
      'usuario': new FormControl('', [Validators.required]),
      'codigoRol': new FormControl('', [Validators.required]),
      'puesto': new FormControl('', [Validators.required]),
    })
  }

  limpiar() {
    this.form.reset({
      codigo: 0,
      codigoOrganizacion: this.organizacionSeleccionada.codigoInterno,
      nroDocumento: '',
      usuario: '',
      codigoRol: '',
      puesto: ''
    });
    this.nombreCompleado = '';
    this.persona = new Persona();
    this.campoIngresado = '';
  }

  buscarPersona() {
    debugger
    this.cargando = true;
    let nroDcumento = this.form.value['nroDocumento'];
    let usuario = this.form.value['usuario'];
    this.personaService.findByCampo(nroDcumento == '' ? usuario : nroDcumento).subscribe((data: any) => {
      this.persona = data;
      this.nombreCompleado = this.persona.grado_LARGA + ' ' + this.persona.arma_LARGA + ' ' + this.persona.apellidos + ' ' + this.persona.nombres;
      this.form.get('usuario').setValue(this.persona.usuario_CHASQUI);
      this.cargando = false;
    }, (error: any) => {
      this.persona = null;
      this.cargando = false;
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
  }

  createTable(Perfil: Perfil[]) {
    this.dataSource = new MatTableDataSource(Perfil);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  close() {
    this.matDialog.close();
  }

  operate() {
    if (this.form.valid) {
      let codigoOrganizacion = this.form.value['codigoOrganizacion'];
      let usuario = this.form.value['usuario'];
      let rol = this.form.value['codigoRol'];
      let puesto = this.form.value['puesto'];
      let codigo = this.form.value['codigo'];
      debugger
      this.perfilService.registrarPerfil(codigoOrganizacion, usuario,
        puesto, rol.codigo, codigo == '' ? 0 : codigo).subscribe(
          {
            next: (response: any) => {
              Swal.fire('OPERACION REALIZADA', response.message, 'success');
              this.perfilService.findByOrganizacion(codigoOrganizacion).subscribe((response: any) => {
                this.createTable(response);
              });
            }, error: (err: any) => {
              debugger
              Swal.fire('AVISO', err.message, 'warning');
            }
          }
        );
    } else {
      Swal.fire('AVISO', 'INGRESE LOS DATOS REQUERIDOS', 'info');
    }
  }

  seleccionarUsuario(perfilSeleccionado: any) {
    this.form.get('codigo').setValue(perfilSeleccionado.codigo);
    this.form.get('usuario').setValue(perfilSeleccionado.usuario.usuario_CHASQUI);
    this.form.get('codigoRol').setValue(perfilSeleccionado.rol);
    this.form.get('puesto').setValue(perfilSeleccionado.nombre);
    this.buscarPersona();
    console.log(perfilSeleccionado);
  }

  compareRoles(role1: any, role2: any) {
    return role1 && role2 ? role1.codigo === role2.codigo : role1 === role2;
  }

  eliminar(codigo: any) {
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
        this.perfilService.eliminarPerfil(codigo).pipe(switchMap((response: any) => {
          return this.perfilService.findByOrganizacion(this.data);
        })).subscribe((responsePerfil: any) => {
          Swal.fire('ELIMINACIÓN CORRECTA', 'SE HA ELIIMINADO PERFIL DEL USUARIO CORRECTAMENTE', 'info');
          this.createTable(responsePerfil);
        });
      }
    })
  };

}
