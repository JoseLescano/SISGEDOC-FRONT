import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Perfil } from 'src/app/_model/perfil';
import { Persona } from 'src/app/_model/persona';
import { PerfilService } from 'src/app/_service/perfil.service';
import { PersonaService } from 'src/app/_service/persona.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-doble-autentificacion',
  templateUrl: './doble-autentificacion.component.html',
  styleUrls: ['./doble-autentificacion.component.css']
})
export class DobleAutentificacionComponent implements OnInit, AfterViewInit {

  campoIngresado:any="";
  persona: Persona = new Persona();
  nombreCompleado: string;
  cargando:boolean=false;
  cargandoPerfil:boolean=false;

  displayedColumns: string[] = ['#', 'Descripcion', 'Rol', 'Organizacion', 'Acciones'];
  dataSource: MatTableDataSource<Perfil>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private personaService: PersonaService,
              private perfilService:PerfilService
  ) { }

  ngOnInit(): void {

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

  createTable(perfiles: Perfil[]){
    this.dataSource = new MatTableDataSource(perfiles);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
  }

  buscarPersona(campo:any){

    this.personaService.findByCampo(this.campoIngresado).subscribe(
      {
        next: (data:any)=> {
          if (data!= null){
            this.cargando = true;
            this.persona = data;
            this.nombreCompleado = this.persona.grado_LARGA + ' '+ this.persona.arma_LARGA + ' '+  this.persona.apellidos+  ' ' + this.persona.nombres;
            this.buscarPerfiles();
            this.cargando=false;
          }else {
            this.persona = null;
            this.nombreCompleado = '';
            this.cargando=false;
            Swal.fire('SIN RESULTADOS', `NO SE ENCONTRO DATOS CON EL CIP INGRESADOx`, 'info');
          }
        },
        error: (error: any| HttpErrorResponse)=> {
          this.nombreCompleado = '';
          this.persona.correo_CHASQUI = '';
          this.dataSource = null;
          this.cargando=false;
          Swal.fire('LO SENTIMOS', `NO SE ENCONTRO DATOS CON EL CIP INGRESADO`, 'info');
        }

      })
  }

  validarNumero(event: KeyboardEvent) {
    const inputChar = String.fromCharCode(event.charCode);
    if (!/^\d+$/.test(inputChar)) {
      event.preventDefault();
    }
  }

  buscarPerfiles(){
    this.perfilService.findByUsuario(this.persona.usuario_CHASQUI).subscribe((data:any)=>{
      this.createTable(data);
    });
  }

  limpiar(){
    this.persona = new Persona();
    this.nombreCompleado = '';
    this.cargando = false;
    this.campoIngresado = '';
    this.dataSource = null;
  }

  eliminarPerfil(codigo:any){
    this.cargando=true;
    this.perfilService.eliminar(codigo).subscribe(data=> {
      this.buscarPerfiles();
      Swal.fire('SE ELIMINO PERFIL', `Se elimino perfil del usuario con éxito`, 'info');
    });

    this.cargando=false;
  }


}
