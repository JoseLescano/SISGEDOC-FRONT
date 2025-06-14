import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DobleAutentificacionComponent } from './doble-autentificacion/doble-autentificacion.component';
import { AccionesComponent } from './documento/acciones/acciones.component';
import { RegistrarComponent } from './documento/archivar/registrar/registrar.component';
import { ViewComponent } from './documento/archivar/view/view.component';
import { BuscarDocumentoComponent } from './documento/buscar-documento/buscar-documento.component';
import { CrearDocumentoComponent } from './documento/crear-documento/crear-documento.component';
import { DecetarComponent } from './documento/decetar/decetar.component';
import { RecibirComponent } from './documento/mesaPartes/recibir/recibir.component';
import { RegistrarMPComponent } from './documento/mesaPartes/registrar/registrarMP.component';
import { FormComponent } from './documento/parte-diario/form/form.component';
import { ParteDiarioComponent } from './documento/parte-diario/parte-diario.component';
import { PendienteComponent } from './documento/pendiente/pendiente.component';
import { ViewRemitidosComponent } from './documento/view-remitidos/view-remitidos.component';
import { EsquemaComponent } from './organizacion/esquema/esquema.component';
import { EnvioExternoComponent } from './documento/mesaPartes/envio-externo/envio-externo.component';
import { ReporteDocumentoComponent } from './documento/mesaPartes/reporte-documento/reporte-documento.component';
import { ReporteRecojoOPComponent } from './documento/mesaPartes/reporte-recojo-op/reporte-recojo-op.component';
import { RegistroCorrespondenciaComponent } from './documento/mesaPartes/registro-correspondencia/registro-correspondencia.component';
import { ListCorrespondenciaComponent } from './documento/mesaPartes/list-correspondencia/list-correspondencia.component';
import { EntregarCorrespondenciaComponent } from './documento/mesaPartes/entregar-correspondencia/entregar-correspondencia.component';
import { ViewDecretadoComponent } from './documento/view-decretado/view-decretado.component';
import { RegistrarDevolverComponent } from './documento/devolver/registrar-devolver/registrar-devolver.component';
import { RegistrarDerivacionComponent } from './documento/derivar/registrar-derivacion/registrar-derivacion.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CreateEditarComponent } from './organizacion/create-editar/create-editar.component';
import { IsLoggedInGuard } from '../auth/guards/is-logged-in.guard';
import { RespuestaComponent } from './documento/respuesta/respuesta.component';
import { Not403Component } from './not403/not403.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ViewElevadosComponent } from './documento/view-elevados/view-elevados.component';
import { MiPerfilComponent } from './mi-perfil/mi-perfil.component';
import { ViewCorregirComponent } from './documento/corregir/view-corregir/view-corregir.component';
import { FormCorregirComponent } from './documento/corregir/form-corregir/form-corregir.component';
import { ListDevolverComponent } from './documento/devolver/list-devolver/list-devolver.component';
import { UpdateDevolverComponent } from './documento/devolver/update-devolver/update-devolver.component';
import { AllUnidadesComponent } from './organizacion/all-unidades/all-unidades.component';
import { AdmDocumentoComponent } from './documento/adm-documento/adm-documento.component';
import { PersonaExternaComponent } from './persona-externa/persona-externa.component';
import { ListPendientesComponent } from './facilita/list-pendientes/list-pendientes.component';
import { SearchComponent } from './organizacion/search/search.component';
import { ViewAccionesComponent } from './acciones/view-acciones/view-acciones.component';
import { ViewPeriodosComponent } from './periodos/view-periodos/view-periodos.component';
import { ViewRolesComponent } from './roles/view-roles/view-roles.component';
import { ViewClasesComponent } from './clases/view-clases.component';
import { ViewMenuComponent } from './menu/view-menu.component';
import { SearchSAComponent } from './documento/search-sa/search-sa.component';
import { EstadisticaSAComponent } from './documento/estadistica-sa/estadistica-sa.component';
import { EnviarDocumentoFacilitaComponent } from './facilita/enviar-documento-facilita/enviar-documento-facilita.component';
import { ListRechazadosComponent } from './documento/devolver/list-rechazados/list-rechazados.component';

const routes: Routes = [

  // COMUNES
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'pages/not-403',
    component: Not403Component
  },
  {
    path: 'pages/not-404',
     component: PageNotFoundComponent
    },

  // =========================================================================================================================
  // JEFE NATIVO O JEFE ACCIDENTAL
  {
    path: 'pendientes',
    component: PendienteComponent,
    canActivate: [IsLoggedInGuard],
  },

  {
    path: 'decretar/:codigoDocumento/:idDecreto',
    component: DecetarComponent
  },
  {
    path: 'acciones/:codigoDocumento/:idDecreto',
    component: AccionesComponent,
  },
  {
    path: 'archivar/:codigoDocumento/:idDecreto',
    component: RegistrarComponent,
  },
  {
    path: 'corregir/:codigoDocumento/:idDecreto',
    component: FormCorregirComponent,
  },
  {
    path: 'devolver/:codigoDocumento/:idDecreto',
    component: RegistrarDevolverComponent,
  },
  {
    path: 'derivar/:codigoDocumento/:idDecreto',
    component: RegistrarDerivacionComponent,
  },
  {
    path: 'crear-documento',
    component: CrearDocumentoComponent,
    canActivate: [IsLoggedInGuard],
  },
  {
    path: 'buscar-documento',
    component: BuscarDocumentoComponent },
  {
    path: 'list-archivados',
    component: ViewComponent,
    canActivate: [IsLoggedInGuard],
  },
  {
    path: 'list-remitidos',
    component: ViewRemitidosComponent,
    canActivate: [IsLoggedInGuard],
  },
  {
    path: 'list-decretados',
    component: ViewDecretadoComponent,
    canActivate: [IsLoggedInGuard],
  },
  {
    path: 'list-elevados',
    component: ViewElevadosComponent,
    canActivate: [IsLoggedInGuard],
  },
  {
    path: 'parte-diario',
    component: ParteDiarioComponent,
    canActivate: [IsLoggedInGuard],
  },
  {
    path: 'form/:codigoDocumento/:idDecreto',
    component: FormComponent },
  {
    path: 'formRespuesta/:codigoDocumento/:idDecreto',
    component: RespuestaComponent,
  },
  {
    path: 'my-profile',
    component: MiPerfilComponent
  },

  {
    path: 'documentos-corregir',
     component: ViewCorregirComponent
  },
  {
    path: 'documentos-devueltos',
     component: ListDevolverComponent
  },
  {
    path: 'documentos-rechazados',
     component: ListRechazadosComponent
  },
  {
    path: 'update-devueltos/:codigoDocumento/:idDecreto',
    component: UpdateDevolverComponent,
  },

  // =========================================================================================================================
  // SUPER ADM
  {
    path: 'admUser',
    component: DobleAutentificacionComponent,
    canActivate: [IsLoggedInGuard],
  },
  {
    path: 'allUnidades',
    component: AllUnidadesComponent,
    canActivate: [IsLoggedInGuard],
  },
  {
    path: 'admDocumento',
    component: AdmDocumentoComponent,
    canActivate: [IsLoggedInGuard],
  },
  {
    path: 'persExterno',
    component: PersonaExternaComponent,
    canActivate: [IsLoggedInGuard],
  },
  {
    path: 'acciones',
    component: ViewAccionesComponent,
    canActivate: [IsLoggedInGuard],
  },
  {
    path: 'periodos',
    component: ViewPeriodosComponent,
    canActivate: [IsLoggedInGuard],
  },
  {
    path: 'clases',
    component: ViewClasesComponent,
    canActivate: [IsLoggedInGuard],
  },
  {
    path: 'menu',
    component: ViewMenuComponent,
    canActivate: [IsLoggedInGuard],
  },
  {
    path: 'roles',
    component: ViewRolesComponent,
    canActivate: [IsLoggedInGuard],
  },
  {
    path: 'searchDocumento',
    component: SearchSAComponent,
    canActivate: [IsLoggedInGuard],
  },
  {
    path: 'estadisticaSA',
    component: EstadisticaSAComponent,
    canActivate: [IsLoggedInGuard],
  },

   // =========================================================================================================================
  // MESA DE PARTES
  {
    path: 'recibir-documento',
    component: RecibirComponent,
  },
  {
    path: 'registrar-documento',
    component: RegistrarMPComponent,
  },
  {
    path: 'envio-externo',
    component: EnvioExternoComponent,
  },
  {
    path: 'report-documento',
    component: ReporteDocumentoComponent,
  },
  {
    path: 'recojo-op',
    component: ReporteRecojoOPComponent,
  },
  {
    path: 'registroCorrespondencia',
    component: RegistroCorrespondenciaComponent,
  },
  {
    path: 'list-correspondencia',
    component: ListCorrespondenciaComponent,
  },
  {
    path: 'entregarCorrespondencia',
    component: EntregarCorrespondenciaComponent,
  },
  {
    path: 'list-facilita',
    component: ListPendientesComponent,
    canActivate: [IsLoggedInGuard],
  },
  {
    path: 'formFacilita/:codigoDocumento',
    component: EnviarDocumentoFacilitaComponent,
  },

 // =========================================================================================================================
 // ADMINISTRADOR
  {
    path: 'organizacion',
    component: EsquemaComponent,
    canActivate: [IsLoggedInGuard],
    children: [
      { path: 'nuevo', component: CreateEditarComponent },
      { path: 'edit/:codigoInterno', component: CreateEditarComponent },
    ],
  },
  {
    path: 'viewPersonal',
    component: SearchComponent,
    canActivate: [IsLoggedInGuard],
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
