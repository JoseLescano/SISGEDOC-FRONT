import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AngularMaterialModule } from '../angular-material/angular-material.module';
import { DobleAutentificacionComponent } from './doble-autentificacion/doble-autentificacion.component';
import { AccionesComponent } from './documento/acciones/acciones.component';
import { RegistrarComponent } from './documento/archivar/registrar/registrar.component';
import { ViewComponent } from './documento/archivar/view/view.component';
import { BuscarDocumentoComponent } from './documento/buscar-documento/buscar-documento.component';
import { CrearDocumentoComponent } from './documento/crear-documento/crear-documento.component';
import { DecetarComponent } from './documento/decetar/decetar.component';
import { EnvioExternoComponent } from './documento/mesaPartes/envio-externo/envio-externo.component';
import { RecibirComponent } from './documento/mesaPartes/recibir/recibir.component';
import { RegistrarMPComponent } from './documento/mesaPartes/registrar/registrarMP.component';
import { FormComponent } from './documento/parte-diario/form/form.component';
import { ParteDiarioComponent } from './documento/parte-diario/parte-diario.component';
import { PendienteComponent } from './documento/pendiente/pendiente.component';
import { ViewDocumentoComponent } from './documento/view-documento/view-documento.component';
import { ViewRemitidosComponent } from './documento/view-remitidos/view-remitidos.component';
import { HeaderComponent } from './header/header.component';
import { EsquemaComponent } from './organizacion/esquema/esquema.component';
import { PagesRoutingModule } from './pages-routing';
import { PrincipalComponent } from './principal/principal.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { BodyComponent } from './body/body.component';
import { ReporteDocumentoComponent } from './documento/mesaPartes/reporte-documento/reporte-documento.component';
import { ReporteRecojoOPComponent } from './documento/mesaPartes/reporte-recojo-op/reporte-recojo-op.component';
import { RegistroCorrespondenciaComponent } from './documento/mesaPartes/registro-correspondencia/registro-correspondencia.component';
import { ListCorrespondenciaComponent } from './documento/mesaPartes/list-correspondencia/list-correspondencia.component';
import { EntregarCorrespondenciaComponent } from './documento/mesaPartes/entregar-correspondencia/entregar-correspondencia.component';
import { ViewDecretadoComponent } from './documento/view-decretado/view-decretado.component';
import { ModalFirmaPeruComponent } from './documento/modal-firma-peru/modal-firma-peru.component';
import { RegistrarDevolverComponent } from './documento/devolver/registrar-devolver/registrar-devolver.component';
import { RegistrarDerivacionComponent } from './documento/derivar/registrar-derivacion/registrar-derivacion.component';
import { PerfilesComponent } from './perfiles/perfiles.component';

@NgModule({
  imports: [
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AngularMaterialModule,
    CommonModule,
    PagesRoutingModule,
    NgSelectModule,
  ],
  declarations: [
    PendienteComponent,
    ViewComponent,
    AccionesComponent,
    DecetarComponent,
    RegistrarComponent,
    HeaderComponent,
    CrearDocumentoComponent,
    DobleAutentificacionComponent,
    BuscarDocumentoComponent,
    RecibirComponent,
    EnvioExternoComponent,
    RegistrarMPComponent,
    EsquemaComponent,
    ViewComponent,
    ViewDocumentoComponent,
    ParteDiarioComponent,
    FormComponent,
    ViewRemitidosComponent,
    PrincipalComponent,
    BodyComponent,
    ReporteDocumentoComponent,
    ReporteRecojoOPComponent,
    RegistroCorrespondenciaComponent,
    ListCorrespondenciaComponent,
    EntregarCorrespondenciaComponent,
    ViewDecretadoComponent,
    ModalFirmaPeruComponent,
    RegistrarDevolverComponent,
    RegistrarDerivacionComponent,
    PerfilesComponent
  ],
   exports:[

  ]
})
export class PagesModule { }
