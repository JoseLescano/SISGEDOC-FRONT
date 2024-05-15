import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrincipalComponent } from './pages/principal/principal.component';
import { LoginComponent } from './pages/login/login.component';

const routes: Routes = [
  { path: '',   redirectTo: 'login', pathMatch: 'full' }, // redirect to `first-component` },
  { path: 'login', component: LoginComponent },
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
