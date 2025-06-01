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
import { DashboardComponent } from './dashboard/dashboard.component';
import { CreateEditarComponent } from './organizacion/create-editar/create-editar.component';
import { ViewUsariosComponent } from './organizacion/view-usarios/view-usarios.component';
import { ValidarRecojoComponent } from './documento/mesaPartes/validar-recojo/validar-recojo.component';
import { RespuestaComponent } from './documento/respuesta/respuesta.component';
import { ModalMfaComponent } from './login/modal-mfa/modal-mfa.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { SeguimientoComponent } from './report/seguimiento/seguimiento.component';
import { Not403Component } from './not403/not403.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { SustentacionComponent } from './documento/archivar/sustentacion/sustentacion.component';
import { ViewElevadosComponent } from './documento/view-elevados/view-elevados.component';
import { TimelineComponent } from './report/timeline/timeline.component';

import { MiPerfilComponent } from './mi-perfil/mi-perfil.component';
import { ViewCorregirComponent } from './documento/corregir/view-corregir/view-corregir.component';
import { FormCorregirComponent } from './documento/corregir/form-corregir/form-corregir.component';
import { ReporteDocumentoDecretoComponent } from './report/reporte-documento-decretado/reporte-documento-decretado.component';
import { RegistrarCorrecionComponent } from './documento/corregir/registrar-correcion/registrar-correcion.component';
import { ListDevolverComponent } from './documento/devolver/list-devolver/list-devolver.component';
import { UpdateDevolverComponent } from './documento/devolver/update-devolver/update-devolver.component';
import { ReportCorrespondenciaComponent } from './report/report-correspondencia/report-correspondencia.component';
import { AllUnidadesComponent } from './organizacion/all-unidades/all-unidades.component';
import { AdmDocumentoComponent } from './documento/adm-documento/adm-documento.component';
import { PersonaExternaComponent } from './persona-externa/persona-externa.component';
import { ListPendientesComponent } from './facilita/list-pendientes/list-pendientes.component';
import { SafeUrlPipe } from './safe-url.pipe';
import { SearchComponent } from './organizacion/search/search.component';
import { ViewAccionesComponent } from './acciones/view-acciones/view-acciones.component';
import { ViewClasesComponent } from './clases/view-clases.component';
import { MantoAccionesComponent } from './acciones/manto-acciones/manto-acciones.component';
import { MantoClasesComponent } from './clases/manto-clases/manto-clases.component';
import { MantoMenuComponent } from './menu/manto-menu/manto-menu.component';
import { ViewMenuComponent } from './menu/view-menu.component';
import { MantoPeriodosComponent } from './periodos/manto-periodos/manto-periodos.component';
import { ViewPeriodosComponent } from './periodos/view-periodos/view-periodos.component';
import { MantoRolComponent } from './roles/manto-roles/manto-roles.component';
import { ViewRolesComponent } from './roles/view-roles/view-roles.component';
import { SearchSAComponent } from './documento/search-sa/search-sa.component';
import { EstadisticaSAComponent } from './documento/estadistica-sa/estadistica-sa.component';
import { EnviarDocumentoFacilitaComponent } from './facilita/enviar-documento-facilita/enviar-documento-facilita.component';


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
    SafeUrlPipe,
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
    PerfilesComponent,
    DashboardComponent,
    CreateEditarComponent,
    ViewUsariosComponent,
    ValidarRecojoComponent,
    RespuestaComponent,
    ModalMfaComponent,
    SidenavComponent,
    SeguimientoComponent,
    Not403Component,
    PageNotFoundComponent,
    SustentacionComponent,
    ViewElevadosComponent,
    TimelineComponent,
    MiPerfilComponent,
    ViewCorregirComponent,
    FormCorregirComponent,
    ReporteDocumentoDecretoComponent,
    RegistrarCorrecionComponent,
    ListDevolverComponent,
    UpdateDevolverComponent,
    ReportCorrespondenciaComponent,
    AllUnidadesComponent,
    AdmDocumentoComponent,
    PersonaExternaComponent,
    ListPendientesComponent,
    SearchComponent,
    ViewAccionesComponent,
    ViewClasesComponent,
    ViewPeriodosComponent,
    ViewMenuComponent,
    ViewRolesComponent,
    MantoAccionesComponent,
    MantoPeriodosComponent,
    MantoClasesComponent,
    MantoMenuComponent,
    MantoRolComponent,
    SearchSAComponent,
    EstadisticaSAComponent,
    EnviarDocumentoFacilitaComponent,

  ],
   exports:[

  ]
})
export class PagesModule { }
