import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginService } from 'src/app/_service/login.service';
import { environment } from 'src/environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';


@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private loginService: LoginService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      const helper = new JwtHelperService();
      let token = sessionStorage.getItem(environment.TOKEN_NAME);
      if (token==null){
        return next.handle(request);
      }else {
        const decodedToken = helper.decodeToken(token);
        const username = decodedToken.sub;
          const isApiUrl = request.url.startsWith(environment.HOST);
          if (!helper.isTokenExpired(token) && isApiUrl) {
              request = request.clone({
                  setHeaders: {
                      Authorization: `Bearer ${token}`
                  }
              });
          }
          return next.handle(request);
      }



    }
}
