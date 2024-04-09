import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PendienteComponent } from './pages/documento/pendiente/pendiente.component';
import { ViewComponent } from './pages/documento/archivar/view/view.component';
import { DocumentoService } from './_service/documento.service';
import { HttpClientModule } from '@angular/common/http';
import { AccionesComponent } from './pages/documento/acciones/acciones.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AngularMaterialModule } from './angular-material/angular-material.module';
import { DecetarComponent } from './pages/documento/decetar/decetar.component';
import { RegistrarComponent } from './pages/documento/archivar/registrar/registrar.component';
import { HeaderComponent } from './pages/header/header.component';
import { CrearDocumentoComponent } from './pages/documento/crear-documento/crear-documento.component';
import { ReactiveFormsModule } from '@angular/forms';


import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { ClaseService } from './_service/clase.service';
import { OrganizacionService } from './_service/organizacion.service';

import {MatTooltipModule} from '@angular/material/tooltip';
import { MatPaginator } from '@angular/material/paginator';
import { DobleAutentificacionComponent } from './pages/doble-autentificacion/doble-autentificacion.component';


@NgModule({
  declarations: [
    AppComponent,
    PendienteComponent,
    ViewComponent,
    AccionesComponent,
    DecetarComponent,
    RegistrarComponent,
    HeaderComponent,
    CrearDocumentoComponent,
    DobleAutentificacionComponent,
    

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    NgSelectModule,
    FormsModule,
    MatTooltipModule
    
  ],
  exports:[],
  providers: [DocumentoService, ClaseService, OrganizacionService],
  bootstrap: [AppComponent]
})
export class AppModule { }
