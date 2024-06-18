import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrincipalComponent } from './pages/principal/principal.component';
import { LoginComponent } from './pages/login/login.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { PerfilesComponent } from './pages/perfiles/perfiles.component';

const routes: Routes = [
  { path: '',   redirectTo: 'login', pathMatch: 'full' }, // redirect to `first-component` },
  { path: 'login', component: LoginComponent },
  { path:'perfiles', component:PerfilesComponent},
  { path: 'principal', component: PrincipalComponent,

  loadChildren: () =>
  import('./pages/pages.module').then(m => m.PagesModule) },
  // { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
