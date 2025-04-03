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
      return next.handle(request).pipe(
        catchError(err => {
          let errorMessage = 'Ocurrió un error inesperado';
          switch (err.status) {
            case 204:
              errorMessage = 'SIN CONTENIDO';
              break;
            case 401:
            case 403:
              errorMessage = err.status === 403
                ? 'NO CUENTA CON LAS CREDENCIALES CORRESPONDIENTES'
                : err.error?.message || 'Error de autenticación';
              this.loginService.logout();
              break;
            case 404:
              errorMessage = err.error?.message || err.error?.title || 'RECURSO NO EXISTE';
              break;
            case 400:
              errorMessage = err.error?.message || err.error?.title || 'ERROR EN LA LOGICA DE NEGOCIO';
              break;
            case 500:
              errorMessage = 'ERROR INTERNO DE SERVIDOR';
              break;
            case 413:
              errorMessage = err.error || 'EL ARCHIVO ES DEMASIADO GRANDE';
              break;
            case 0:
              errorMessage = 'SIN CONEXIÓN AL SERVIDOR';
              this.loginService.logout();
              break;
          }

          return throwError(() => new Error(errorMessage));
        })
      );
    }

}
