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
import { switchMap } from 'rxjs';
import { ViewUsariosComponent } from '../view-usarios/view-usarios.component';
//import * as $ from 'jquery';
const $ = go.GraphObject.make;

@Component({
  selector: 'app-esquema',
  templateUrl: './esquema.component.html',
  styleUrls: ['./esquema.component.css']
})
export class EsquemaComponent implements OnInit, AfterViewInit {

  private diagram: go.Diagram | null = null;
  organizaciones:OrganizacionDiagram[];

  displayedColumns: string[] = ['CodigoInterno', 'Acronimo', 'Nombre completo', 'Nivel', 'Cargo', 'Acciones'];
  dataSource: MatTableDataSource<OrganizacionDiagram>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  cargando: boolean;

  constructor(
    private organizacionService:OrganizacionService,
    public dialog: MatDialog
  ) { }

  _window(): any {
    // return the global native browser window object
    return window;
  }

  ngOnInit(): void {
    this.cargando = true;
    this.createDiagramaOrganizacion();
    this.organizacionService.findForDiagrama(
      sessionStorage.getItem(environment.codigoOrganizacion)).subscribe((response:any)=>{
        debugger;
        this.createTable(response);
        this.cargando = false;
      }, error=> {
        this.cargando=false;
        Swal.fire('Lo sentimos', `Se presento un inconveniente en la consulta`, 'warning');
      });
  }

  openDialog(codigoOrganizacion:any, codigoPadre?:any){
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

  createTable(organizacion: OrganizacionDiagram[]){
    this.dataSource = new MatTableDataSource(organizacion);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
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
        })).subscribe((response:any)=> {
          this.organizacionService.setOrganizacionCambio(response.data);
          Swal.fire('OPERACION REALIZADA', 'SE ELIMINO ORGANIZACION', 'info');
        }, error => {
          Swal.fire('LO SENTIMOS', 'SE PRESENTO UN INCONVENIENTE', 'warning');
        });
      }
    })
  }




  createDiagramaOrganizacion(){
    let _this=this;

    this.organizacionService.findForDiagrama(sessionStorage.getItem(environment.codigoOrganizacion)).subscribe((resp:any) => {
      _this.organizaciones = resp;
          this._window().createDiagramaOrganizacion(resp,
            function(stringOrganizationPadre:any, dataRespuesta:any,incallbackOut:any){
              _this.openDialog(null, stringOrganizationPadre);
              /*
              debugger;
            Swal.fire({
              title: 'NUEVA ORGANIZACIÓN',
              html: `<input type="text" id="nombreCorto_ParamLTS_TEMP" class="form-control mb-2" placeholder="Ingrese acronimo">
              <input type="text" id="nombreLargo_ParamLTS_TEMP"  class="form-control mb-2" placeholder="Ingrese nombre">
              <textarea  rows="5" id="cargo_ParamLTS_TEMP"  class="form-control mb-2" placeholder="Ingrese cargo"></textarea>
              <input type="text" id="indicativo_ParamLTS_TEMP" class="form-control mb-2" placeholder="Ingrese indicativo">
              `,
              confirmButtonText: 'Guardar',
              focusConfirm: false,
              preConfirm: () => {
                let nombreCorto = _this._window().$()('#nombreCorto_ParamLTS_TEMP')[0].value;
                let nombreLargo = _this._window().$()('#nombreLargo_ParamLTS_TEMP')[0].value;
                let indicativo = _this._window().getJquery()('#indicativo_ParamLTS_TEMP')[0].value
                let cargo = _this._window().getJquery()('#cargo_ParamLTS_TEMP')[0].value;

                if (!nombreCorto || !nombreLargo || !indicativo || !cargo) {
                  Swal.showValidationMessage(`Por favor complete los datos`);
                }
                return { nombreCorto: nombreCorto, nombreLargo: nombreLargo, indicativo:indicativo, cargo: cargo}
              }
            }).then((result:any) => {
              if((result.dismiss!=undefined && result.dismiss=='backdrop')){
                return;

                }
              if(result.value==undefined){
                return;
              }
              // result.value.nombreCorto;
             // dataRespuesta.codigoInterna=dataRespuesta.title;
              dataRespuesta.nombreCorto=result.value.nombreCorto;
              dataRespuesta.nombreLargo=result.value.nombreLargo;
              dataRespuesta.indicativo=result.value.indicativo;
              dataRespuesta.name=result.value.nombreCorto;
              dataRespuesta.cargo=result.value.cargo;
              debugger;
              _this.organizacionService.saveOrganizacion(stringOrganizationPadre,dataRespuesta).subscribe((data) =>{
                  if(incallbackOut!=null){
                    incallbackOut();
                  }
                  _this.createDiagramaOrganizacion();
                  _this._window().getJquery().fadeOut();
                  Swal.fire('Éxito ', `Se grabó la nueva organización`, 'success');
              });
            })
            */
          },
          function(codigoInterna:any, callBackOutEliminar:any){
            _this.eliminar(codigoInterna);
          }/*
          function(codigoInterna:any,callBackOutEliminar:any){
            Swal.fire({
              title: 'Estas seguro?',
              text: "Esta organización se eliminará permanentemente",
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Si, eliminalo!'
            }).then((result:any) => {
              if((result.dismiss!=undefined && result.dismiss=='backdrop')){
                return;

                }
              if (result.isConfirmed) {
              //   _this.organizacionService.eliminarOrganizacionEnCascada(codigoInterna).subscribe((data: any) =>{
              //     callBackOutEliminar();
              //     _this._window().getJquery()('.preloader').fadeOut();
              //     _this.createDiagramaOrganizacion();
              //     if (data.mensaje === 'SE ELIMINO ORGANIZACION CORRECTAMENTE!')
              //       Swal.fire('Eliminado ', data.mensaje, 'success');
              //     else Swal.fire('Lo sentimos!', data.mensaje, 'warning');
              // }, (error: any) => {
              //   Swal.fire('Lo sentimos!', 'Se presento un inconveniente', 'warning');
              // });
              }
            })
          }*/,
          function(bq:any,callBackOutUpdate:any){
            debugger;
            let organizacion:any={};
            organizacion.acronimo=bq.name;
            organizacion.nombreLargo="";
            organizacion.indicativo="";
            organizacion.codigoInterno=bq.CODIGO;

            // _this.organizacionService.buscarOrganizacionPorCodigo(bq.CODIGO).subscribe((data: any) => {
            //   organizacion.vointerna_NOM_LARGO = data[0].vointerna_NOM_LARGO;
            //   organizacion.cointerna_INDICATIVO=data[0].coindicativo;
            //   organizacion.cargo = data[0].cargo;
            //   _this.modalVerOrganizacion(organizacion);
            // });



           // _this.modalVerOrganizacion(organizacion);

          },
          function(bq:any,callBackOutAgregarUsuarios:any){


            let organizacion:any={};
            organizacion.vointerna_NOM_CORTO=bq.name;
            organizacion.vointerna_NOM_LARGO="";
            organizacion.cointerna_INDICATIVO="";
            organizacion.cointerna_CODIGO=bq.CODIGO;

            // let dialogVerDocumento = _this.dialog.open(
            //   DialogoUsuariosOrganizacionComponent,
            //   {
            //     height: '90%',
            //     width: '70%',
            //   }
            // );


            // dialogVerDocumento.componentInstance.parentr = dialogVerDocumento;
            // dialogVerDocumento.componentInstance.codigoInterna=organizacion.cointerna_CODIGO;


            // dialogVerDocumento.componentInstance.call_receiveMessage = function (
            //   documentoIn: any
            // ) {
            //   _this.receiveMessage(documentoIn);
            // };

          },
          function(bq:any,callBackOutAgregarServicio:any){


            let organizacion:any={};
            organizacion.vointerna_NOM_CORTO=bq.name;
            organizacion.vointerna_NOM_LARGO="";
            organizacion.cointerna_INDICATIVO="";
            organizacion.cointerna_CODIGO=bq.CODIGO;

            // let dialogVerDocumento = _this.dialog.open(
            //   DialogoUsuarioServicioComponent,
            //   {
            //     height: '90%',
            //     width: '70%',
            //   }
            // );


            // dialogVerDocumento.componentInstance.parentr = dialogVerDocumento;
            // dialogVerDocumento.componentInstance.codigoInterna=organizacion.cointerna_CODIGO;


            // dialogVerDocumento.componentInstance.call_receiveMessage = function (
            //   documentoIn: any
            // ) {
            //   _this.receiveMessage(documentoIn);
            // };

          },


          );
    });

  }



}
