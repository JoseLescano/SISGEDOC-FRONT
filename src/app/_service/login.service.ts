import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';

interface ILoginRequest {
  username: string;
  password: string;
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

  login(username: string, password: string) {
    let formData:FormData = new FormData();
    formData.append('usuario', username);
    formData.append('password', password);
    return this.http.post<any>(`${this.url}`, formData);
  }

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  isLogged(){
    const token = sessionStorage.getItem(environment.TOKEN_NAME);
    return token != null;
  }

}
