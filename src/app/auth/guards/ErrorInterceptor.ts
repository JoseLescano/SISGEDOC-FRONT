import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { LoginService } from 'src/app/_service/login.service';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(
      private loginService: LoginService,
      private router: Router) { }

    error: any = '';

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            debugger
            if ([204].includes(err.status)){
              this.error = 'SIN DATA';
            }
            if ([401, 403,404].includes(err.status)) {
              if(err.status==403){
                this.error = 'NO CUENTA CON LAS CREDENCIALES CORRESPONDENTES';
                this.loginService.logout();
              }  if(err.status==404){
                debugger
                this.error = err.error.message || err.error.title;
              }else {
                this.error = err.error.message;
                this.loginService.logout();
              }
            }

            if ([500,400].includes(err.status)){
                if(err.status==500)
                  this.error ='ERROR INTERNO DE SERVIDOR';
                else if(err.status==400)
                  this.error ='ERROR EN LA LOGICA DE NEGOCIO';
            }
            if ([0].includes(err.status)){
              this.error ='SIN CONEXION AL SERVIDOR';
              this.loginService.logout();
            } else this.error = err.error.message;

            // const error = err.error.message || err.statusText;
            return throwError(this.error);
        }))
    }
}
