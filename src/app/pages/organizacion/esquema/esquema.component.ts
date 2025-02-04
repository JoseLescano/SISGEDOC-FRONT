import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import * as go from 'gojs';
import { OrganizacionDiagram } from 'src/app/_DTO/OrganizacionDiagram';
import { Organizacion } from 'src/app/_model/organizacion';
import { OrganizacionService } from 'src/app/_service/organizacion.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { CreateEditarComponent } from '../create-editar/create-editar.component';
import { MatDialog } from '@angular/material/dialog';
import { ViewUsariosComponent } from '../view-usarios/view-usarios.component';
import { switchMap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
//import * as $ from 'jquery';
const $ = go.GraphObject.make;

@Component({
  selector: 'app-esquema',
  templateUrl: './esquema.component.html',
  styleUrls: ['./esquema.component.css']
})
export class EsquemaComponent implements OnInit {

  private diagram: go.Diagram | null = null;
  organizaciones:OrganizacionDiagram[];
  cargando: boolean;


  constructor(
    private organizacionService:OrganizacionService,
    public dialog: MatDialog,
    private router: Router
  ) { }

  _window(): any {
    return window;
  }

  ngOnInit(): void {
    this.createDiagramaOrganizacion();
  }

  openDialog(codigoOrganizacion:any, codigoPadre?:String){
    let informacion = {
      editar: codigoOrganizacion,
      padre: codigoPadre
    }
    this.dialog.open(CreateEditarComponent, {
      width: '50%',
      data: informacion,
    });
  }

  openDialogUsuario(codigoInterno:any){
    this.dialog.open(ViewUsariosComponent, {
      width: '90%',
      height:'85%',
      data: codigoInterno,
    });
  }



  eliminar(organizacion:any){

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
        this.organizacionService.eliminarOrganizacion(organizacion.codigoInterno).pipe(switchMap(()=>{
          return this.organizacionService.findByCodigoInterno(sessionStorage.getItem(environment.codigoOrganizacion));
        })).subscribe({
          next : (response: any)=> {
            this.router.navigate(['/principal/organizacion']).then(() => {
             location.reload();
            });
            Swal.fire('OPERACION REALIZADA', 'SE ELIMINO ORGANIZACION', 'info');
          }, error: (err: any) => {
            Swal.fire('LO SENTIMOS', 'SE PRESENTO UN INCONVENIENTE', 'warning');
          }
        });
      }
    })
  }


  createDiagramaOrganizacion(){
    let _this=this;
    this.organizacionService.findForDiagrama(sessionStorage.getItem(environment.codigoOrganizacion))
    .subscribe( {
      next: (resp:any) => {
        // this.createTable(resp);
        _this.organizaciones = resp;
        this._window().createDiagramaOrganizacion(resp,
            function(stringOrganizationPadre:String, dataRespuesta:any,incallbackOut:any){
              _this.openDialog(null, stringOrganizationPadre);
          },
          function(codigoInterna:any, callBackOutEliminar:any){
            let org : Organizacion = new Organizacion();
            org.codigoInterno= codigoInterna;
            _this.eliminar(org);
          },
          function(bq:any,callBackOutUpdate:any){
            let codigoInterno:any;
            codigoInterno=bq.CODIGO;
            _this.openDialog(codigoInterno);
          },
          function(bq:any,callBackOutAgregarUsuarios:any){
            let codigoInterno:any;
            codigoInterno=bq.CODIGO;
            _this.openDialogUsuario(codigoInterno);
          },
          function(bq:any,callBackOutAgregarServicio:any){
            let organizacion:any={};
            organizacion.vointerna_NOM_CORTO=bq.name;
            organizacion.vointerna_NOM_LARGO="";
            organizacion.cointerna_INDICATIVO="";
            organizacion.cointerna_CODIGO=bq.CODIGO;
          },
        );
      }, error: (err: any)=> {
        // if (err==='Access Denied'){
        //   Swal.fire('ACCESO DENEGADO', 'NO TIENE LAS CREDENCIALES NECESARIAS PARA ESTA OPCION', 'info');
        //   this.router.navigate(['/principal/dashboard']);
        // } else Swal.fire('LO SENTIMOS', 'SE PRESENTO UN INCONVENIENTE', 'info');
      }
    })
  }

}
