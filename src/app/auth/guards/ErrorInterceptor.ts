import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { LoginService } from 'src/app/_service/login.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(
      private loginService: LoginService,
      private router: Router) { }

    error: any = '';

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        return next.handle(request).pipe(catchError(err => {
            if ([401, 403].includes(err.status)) {
              if(err.status==403){
                this.error = 'NO CUENTA CON LAS CREDENCIALES CORRESPONDENTES';
                this.loginService.logout();
              }else {
                this.error = 'SESION EXPIRADA';
                this.loginService.logout();
              }
            }else {
              if ([0].includes(err.status)){
                debugger;
                this.error ='ERROR EN CONEXION CON EL SERVIDOR';
                //this.loginService.logout();
              }
            }
            // const error = err.error.message || err.statusText;
            return throwError(this.error);
        }))
    }
}
