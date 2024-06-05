import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { VerificationRequest } from '../_model/verification-request';
import { Observable, catchError } from 'rxjs';

interface ILoginRequest {
  username: string;
  password: string;
  token:string;
}
interface Token {
  token: string
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private url : string = environment.HOST+'login';

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  login(username: string, password: string, token:any) {
    debugger;
    const body: ILoginRequest = { username, password, token };
    return this.http.post<any>(`${this.url}/ad`, body);
  }

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  isLogged(){
    const token = sessionStorage.getItem(environment.TOKEN_NAME);
    return token != null;
  }

  verifyCode(verificationRequest: VerificationRequest): Observable<any> {
    return this.http.post<any>(`${this.url}/verify`, verificationRequest).pipe(
      catchError(error => {
        throw 'Error al verificar el código: ' + error.message;
      })
    );
  }

  key_recaptcha(token: string) {
    const body: Token = {token};
    return this.http.post((`${this.url}/captcha`), body);
  }

}
