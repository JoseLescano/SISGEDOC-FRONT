import { Component, OnInit } from '@angular/core';
import * as go from 'gojs';
import { OrganizacionDiagram } from 'src/app/_DTO/OrganizacionDiagram';
import { Organizacion } from 'src/app/_model/organizacion';
import { OrganizacionService } from 'src/app/_service/organizacion.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

const $ = go.GraphObject.make;

@Component({
  selector: 'app-esquema',
  templateUrl: './esquema.component.html',
  styleUrls: ['./esquema.component.css']
})
export class EsquemaComponent implements OnInit {

  private diagram: go.Diagram | null = null;
  organizaciones:OrganizacionDiagram[];

  constructor(private organizacionService:OrganizacionService) { }

  _window(): any {
    // return the global native browser window object
    return window;
  }

  ngOnInit(): void {
    this.createDiagramaOrganizacion();

    var barOptions_stacked = {
      tooltips: {
          enabled: false
      },
      hover :{
          animationDuration:0
      },
      scales: {
          xAxes: [{
              ticks: {
                  beginAtZero:true,
                  fontFamily: "'Open Sans Bold', sans-serif",
                  fontSize:11
              },
              scaleLabel:{
                  display:false
              },
              gridLines: {
              },
              stacked: true
          }],
          yAxes: [{
              gridLines: {
                  display:false,
                  color: "#fff",
                  zeroLineColor: "#fff",
                  zeroLineWidth: 0
              },
              ticks: {
                  fontFamily: "'Open Sans Bold', sans-serif",
                  fontSize:11
              },
              stacked: true
          }]
      },
      legend:{
          display:false
      },


      pointLabelFontFamily : "Quadon Extra Bold",
      scaleFontFamily : "Quadon Extra Bold",
  }
  }

  

  createDiagramaOrganizacion(){
    let _this=this;
    this.organizacionService.findForDiagrama(sessionStorage.getItem(environment.codigoOrganizacion)).subscribe((resp:any) => {
        //console.log(resp)
      _this.organizaciones = resp;
          this._window().createDiagramaOrganizacion(resp,
            function(stringOrganizationPadre:any, dataRespuesta:any,incallbackOut:any){
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
                let nombreCorto = _this._window().getJquery()('#nombreCorto_ParamLTS_TEMP')[0].value;
                let nombreLargo = _this._window().getJquery()('#nombreLargo_ParamLTS_TEMP')[0].value;
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
              // _this.organizacionService.saveOrganizacion(stringOrganizationPadre,dataRespuesta).subscribe((data) =>{
              //     if(incallbackOut!=null){
              //       incallbackOut();
              //     }
              //     _this._window().getJquery()('.preloader').fadeOut();
              //     _this.cargarOrganizaciones();
              //     Swal.fire('Éxito ', `Se grabó la nueva organización`, 'success');
              // });
            }) 
          }

          ,function(codigoInterna:any,callBackOutEliminar:any){
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
          },
          function(bq:any,callBackOutUpdate:any){

            let organizacion:any={};
            organizacion.vointerna_NOM_CORTO=bq.name;
            organizacion.vointerna_NOM_LARGO="";
            organizacion.cointerna_INDICATIVO="";
            organizacion.cointerna_CODIGO=bq.CODIGO;

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
