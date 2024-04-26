import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PendienteComponent } from './pages/documento/pendiente/pendiente.component';
import { DecetarComponent } from './pages/documento/decetar/decetar.component';
import { AccionesComponent } from './pages/documento/acciones/acciones.component';
import { RegistrarComponent } from './pages/documento/archivar/registrar/registrar.component';
import { CrearDocumentoComponent } from './pages/documento/crear-documento/crear-documento.component';
import { DobleAutentificacionComponent } from './pages/doble-autentificacion/doble-autentificacion.component';
import { BuscarDocumentoComponent } from './pages/documento/buscar-documento/buscar-documento.component';
import { RecibirComponent } from './pages/documento/mesaPartes/recibir/recibir.component';
import { RegistrarMPComponent } from './pages/documento/mesaPartes/registrar/registrarMP.component';
import { EsquemaComponent } from './pages/organizacion/esquema/esquema.component';
import { ViewComponent } from './pages/documento/archivar/view/view.component';

const routes: Routes = [
  {path:'', redirectTo:'pendientes', pathMatch:'full' },
  {path:'pendientes', component:PendienteComponent},
  {path:'decretar', component:DecetarComponent},
  { path: 'acciones/:codigoDocumento', component: AccionesComponent },
  { path: 'archivar/:codigoDocumento', component: RegistrarComponent },
  { path: 'crear-documento', component: CrearDocumentoComponent },
  { path: 'resetear-authentificacion', component: DobleAutentificacionComponent },
  { path: 'buscar-documento/:tipoReporte', component: BuscarDocumentoComponent },
  { path: 'recibir-documento', component: RecibirComponent },
  { path: 'registrar-documento', component: RegistrarMPComponent },
  { path: 'organizacion', component: EsquemaComponent },
  { path: 'list-archivados', component: ViewComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
