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

const routes: Routes = [

  { path: '', redirectTo: 'perfiles', pathMatch:'full' },
  // { path:'', redirectTo: environment.rol=='002' || environment.rol=='000'? 'pendientes': 'recibir-documento', pathMatch:'full' },
  { path:'pendientes', component:PendienteComponent},
  { path:'dashboard', component:DashboardComponent},
  { path:'perfiles', component:PerfilesComponent},
  { path:'decretar/:codigoDocumento', component:DecetarComponent},
  { path: 'acciones/:codigoDocumento', component: AccionesComponent },
  { path: 'archivar/:codigoDocumento', component: RegistrarComponent },
  { path: 'devolver/:codigoDocumento', component: RegistrarDevolverComponent },
  { path: 'derivar/:codigoDocumento', component: RegistrarDerivacionComponent },
  { path: 'crear-documento', component: CrearDocumentoComponent },
  { path: 'resetear-authentificacion', component: DobleAutentificacionComponent },
  { path: 'buscar-documento/:tipoReporte', component: BuscarDocumentoComponent },
  { path: 'recibir-documento', component: RecibirComponent },
  { path: 'registrar-documento', component: RegistrarMPComponent },
  { path: 'envio-externo', component: EnvioExternoComponent },
  { path: 'organizacion', component: EsquemaComponent, children:[
    { path: 'nuevo', component: CreateEditarComponent },
    { path: 'edit/:codigoInterno', component: CreateEditarComponent }
  ] },
  { path: 'list-archivados', component: ViewComponent },
  { path: 'list-remitidos', component: ViewRemitidosComponent },
  { path: 'list-decretados', component: ViewDecretadoComponent },
  { path: 'report-documento', component: ReporteDocumentoComponent },
  { path: 'recojo-op', component: ReporteRecojoOPComponent },
  { path: 'registroCorrespondencia', component: RegistroCorrespondenciaComponent },
  { path: 'list-correspondencia', component: ListCorrespondenciaComponent },
  { path: 'entregarCorrespondencia', component: EntregarCorrespondenciaComponent },
  { path: 'parte-diario', component: ParteDiarioComponent },
  { path: 'form/:codigoDocumento', component: FormComponent  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
