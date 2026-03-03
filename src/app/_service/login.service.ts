import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { VerificationRequest } from '../_model/verification-request';
import { Observable, catchError } from 'rxjs';

export interface ILoginRequest {
  username: string;
  password: string;
  token: string;
}
interface Token {
  token: string
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private url: string = environment.HOST + 'login';

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  login(jwtRequest: ILoginRequest): Observable<any> {
    debugger
    jwtRequest.username = jwtRequest.username.toLowerCase();
    return this.http.post<any>(`${this.url}/ad`, jwtRequest);
  }

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  isLogged() {
    const token = sessionStorage.getItem(environment.TOKEN_NAME);
    return token != null;
  }

  verifyCode(verificationRequest: any): Observable<any> {

    return this.http.post<any>(`${this.url}/twofa/verify`, verificationRequest);
  }

  key_recaptcha(token: string) {
    const body: Token = { token };
    return this.http.post((`${this.url}/captcha`), body);
  }

  recoverPassword(data: { cip: string; dni: string; correo: string }): Observable<any> {
    return this.http.post<any>(`${this.url}/recover-password`, data);
  }

}
