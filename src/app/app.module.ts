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
import { JwtInterceptor } from './auth/guards/JwtInterceptor';
import { RECAPTCHA_SETTINGS, RECAPTCHA_V3_SITE_KEY, RecaptchaModule, RecaptchaSettings, RecaptchaV3Module } from 'ng-recaptcha';
import { environment } from 'src/environments/environment';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { FullscreenOverlayContainer, OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { CdkMenuModule } from '@angular/cdk/menu';
import { MatInputModule } from '@angular/material/input';
import { ErrorInterceptor } from './auth/guards/ErrorInterceptor';

export function tokenGetter() {
  return sessionStorage.getItem("access_token");
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
    OverlayModule,
    CdkMenuModule,
    RecaptchaModule,
    RecaptchaV3Module,
    PagesRoutingModule,
    MatInputModule,
    JwtModule.forRoot({
      config: {
      tokenGetter: tokenGetter,
      // allowedDomains: ["localhost:8080"],
      allowedDomains: ["sisgedo.ejercito.mil.pe", "walla.ejercito.mil.pe",
        "backend.ejercito.mil.pe", "backend-balanceo-1.ejercito.mil.pe", "backend-balanceo-2.ejercito.mil.pe",
        "dev-sisgedo.ejercito.mil.pe"],
      //disallowedRoutes: ["http://localhost:8080/login/forget"]
      disallowedRoutes: ["https://sisgedo.ejercito.mil.pe/login/forget"],
      },
    }),


  ],
  providers: [DocumentoService, ClaseService, OrganizacionService,
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: {  siteKey: environment.recaptcha.siteKey,} as RecaptchaSettings,
    },
    {
      provide: RECAPTCHA_V3_SITE_KEY,
      useValue: environment.recaptcha.siteKeyV3,
    },
    {
      provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true
    },
    {
      provide: LocationStrategy, useClass: HashLocationStrategy
    },
    {provide: OverlayContainer, useClass: FullscreenOverlayContainer}
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }
