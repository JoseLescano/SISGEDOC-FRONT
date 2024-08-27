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

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            if ([401, 403].includes(err.status)) {
              debugger;
              if(err.status==403){
                debugger;
                Swal.fire('ACCESO DENEGADO', err.error.details, 'info');
                this.router.navigate(['/principal/dashboard']);
              }else {
                Swal.fire('ACCESO DENEGADO', 'SESION EXPIRADA', 'info');
                this.loginService.logout();
              }
            }else {
              if ([0].includes(err.status)){
                debugger;
                Swal.fire('LO SENTIMOS', 'ERROR EN CONEXION CON EL SERVIDOR', 'info');
                //this.loginService.logout();
              }
            }
            const error = err.error.message || err.statusText;
            return throwError(error);
        }))
    }
}
