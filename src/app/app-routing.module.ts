import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PendienteComponent } from './pages/documento/pendiente/pendiente.component';
import { DecetarComponent } from './pages/documento/decetar/decetar.component';
import { AccionesComponent } from './pages/documento/acciones/acciones.component';
import { RegistrarComponent } from './pages/documento/archivar/registrar/registrar.component';
import { CrearDocumentoComponent } from './pages/documento/crear-documento/crear-documento.component';
import { DobleAutentificacionComponent } from './pages/doble-autentificacion/doble-autentificacion.component';

const routes: Routes = [
  {path:'', redirectTo:'pendientes', pathMatch:'full' },
  {path:'pendientes', component:PendienteComponent},
  {path:'decretar', component:DecetarComponent},
  { path: 'acciones/:codigoDocumento', component: AccionesComponent },
  { path: 'archivar/:codigoDocumento', component: RegistrarComponent },
  { path: 'crear-documento', component: CrearDocumentoComponent },
  { path: 'resetear-authentificacion', component: DobleAutentificacionComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
