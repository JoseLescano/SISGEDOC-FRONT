import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { environment } from 'src/environments/environment';
import { EnvioExternoComponent } from './documento/mesaPartes/envio-externo/envio-externo.component';
import { ReporteDocumentoComponent } from './documento/mesaPartes/reporte-documento/reporte-documento.component';
import { ReporteRecojoOPComponent } from './documento/mesaPartes/reporte-recojo-op/reporte-recojo-op.component';
import { RegistroCorrespondenciaComponent } from './documento/mesaPartes/registro-correspondencia/registro-correspondencia.component';
import { ListCorrespondenciaComponent } from './documento/mesaPartes/list-correspondencia/list-correspondencia.component';
import { EntregarCorrespondenciaComponent } from './documento/mesaPartes/entregar-correspondencia/entregar-correspondencia.component';
import { ViewDecretadoComponent } from './documento/view-decretado/view-decretado.component';
import { RegistrarDevolverComponent } from './documento/devolver/registrar-devolver/registrar-devolver.component';
import { RegistrarDerivacionComponent } from './documento/derivar/registrar-derivacion/registrar-derivacion.component';
import { PerfilesComponent } from './perfiles/perfiles.component';
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
import { RegistrarCorrecionComponent } from './documento/corregir/registrar-correcion/registrar-correcion.component';
import { ListDevolverComponent } from './documento/devolver/list-devolver/list-devolver.component';
import { UpdateDevolverComponent } from './documento/devolver/update-devolver/update-devolver.component';
import { AllUnidadesComponent } from './organizacion/all-unidades/all-unidades.component';
import { AdmDocumentoComponent } from './documento/adm-documento/adm-documento.component';
import { PersonaExternaComponent } from './persona-externa/persona-externa.component';
import { ListPendientesComponent } from './facilita/list-pendientes/list-pendientes.component';
import { SearchComponent } from './organizacion/search/search.component';

const routes: Routes = [

   { path: '', redirectTo: 'dashboard', pathMatch:'full' },
  // { path:'', redirectTo: environment.rol=='002' || environment.rol=='000'? 'pendientes': 'recibir-documento', pathMatch:'full' },
  { path:'pendientes', component:PendienteComponent, canActivate: [IsLoggedInGuard]},
  { path:'dashboard', component:DashboardComponent},

  { path:'decretar/:codigoDocumento/:idDecreto', component:DecetarComponent},
  { path: 'acciones/:codigoDocumento/:idDecreto', component: AccionesComponent},
  { path: 'archivar/:codigoDocumento/:idDecreto', component: RegistrarComponent },
  { path: 'corregir/:codigoDocumento', component: FormCorregirComponent },
  { path: 'devolver/:codigoDocumento/:idDecreto', component: RegistrarDevolverComponent },
  { path: 'derivar/:codigoDocumento/:idDecreto', component: RegistrarDerivacionComponent },
  // { path: 'enviar-corregir/:codigoDocumento/:idDecreto', component: RegistrarCorrecionComponent },
  { path: 'crear-documento', component: CrearDocumentoComponent, canActivate: [IsLoggedInGuard] },
  { path: 'admUser', component: DobleAutentificacionComponent, canActivate: [IsLoggedInGuard] },
  { path: 'allUnidades', component: AllUnidadesComponent, canActivate: [IsLoggedInGuard] },
  { path: 'admDocumento', component: AdmDocumentoComponent, canActivate: [IsLoggedInGuard] },
  { path: 'buscar-documento', component: BuscarDocumentoComponent },
  { path: 'recibir-documento', component: RecibirComponent, canActivate: [IsLoggedInGuard] },
  { path: 'registrar-documento', component: RegistrarMPComponent },
  { path: 'envio-externo', component: EnvioExternoComponent },
  { path: 'organizacion', component: EsquemaComponent, canActivate: [IsLoggedInGuard], children:[
    { path: 'nuevo', component: CreateEditarComponent },
    { path: 'edit/:codigoInterno', component: CreateEditarComponent }
  ] },
  { path: 'list-archivados', component: ViewComponent, canActivate: [IsLoggedInGuard] },
  { path: 'list-remitidos', component: ViewRemitidosComponent, canActivate: [IsLoggedInGuard] },
  { path: 'list-decretados', component: ViewDecretadoComponent, canActivate: [IsLoggedInGuard] },
  { path: 'list-elevados', component: ViewElevadosComponent, canActivate: [IsLoggedInGuard] },
  { path: 'report-documento', component: ReporteDocumentoComponent, canActivate: [IsLoggedInGuard] },
  { path: 'recojo-op', component: ReporteRecojoOPComponent, canActivate: [IsLoggedInGuard] },
  { path: 'registroCorrespondencia', component: RegistroCorrespondenciaComponent, canActivate: [IsLoggedInGuard] },
  { path: 'list-correspondencia', component: ListCorrespondenciaComponent },
  { path: 'entregarCorrespondencia', component: EntregarCorrespondenciaComponent, canActivate: [IsLoggedInGuard] },
  { path: 'parte-diario', component: ParteDiarioComponent, canActivate: [IsLoggedInGuard] },
  { path: 'form/:codigoDocumento/:idDecreto', component: FormComponent  },
  { path: 'formRespuesta/:codigoDocumento/:idDecreto', component: RespuestaComponent  },
  { path: 'my-profile', component: MiPerfilComponent  },
  { path: 'pages/not-403', component: Not403Component  },
  { path: 'pages/not-404', component: PageNotFoundComponent  },
  { path: 'documentos-corregir', component: ViewCorregirComponent  },
  { path: 'documentos-devueltos', component: ListDevolverComponent  },
  { path: 'persExterno', component: PersonaExternaComponent  },
  { path: 'update-devueltos/:codigoDocumento/:idDecreto', component: UpdateDevolverComponent  },
  { path: 'list-facilita', component: ListPendientesComponent  },

  { path: 'viewPersonal', component: SearchComponent  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
