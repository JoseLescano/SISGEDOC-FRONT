import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { DocumentoService } from './_service/documento.service';
import { ClaseService } from './_service/clase.service';
import { OrganizacionService } from './_service/organizacion.service';

import { NgSelectModule } from '@ng-select/ng-select';
import { AngularMaterialModule } from './angular-material/angular-material.module';
import { PagesModule } from './pages/pages.module';
import { PagesRoutingModule } from './pages/pages-routing';
import { LoginComponent } from './pages/login/login.component';

import { JwtModule } from "@auth0/angular-jwt";
import { IsLoggedInGuard } from './auth/guards/is-logged-in.guard';
import { JwtInterceptor } from './auth/guards/JwtInterceptor';
import { RECAPTCHA_SETTINGS, RecaptchaSettings, RecaptchaV3Module } from 'ng-recaptcha';
import { environment } from 'src/environments/environment';


export function tokenGetter() {
  return localStorage.getItem("access_token");
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
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
    PagesModule,
    // RecaptchaModule,
    RecaptchaV3Module,
    PagesRoutingModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: ["localhost:8080"],
        disallowedRoutes: ["http://example.com/examplebadroute/"],
      },
    }),


  ],
  providers: [DocumentoService, ClaseService, OrganizacionService,
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: {  siteKey: environment.recaptcha.siteKey,} as RecaptchaSettings,
    },
    // {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: false}}
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }
