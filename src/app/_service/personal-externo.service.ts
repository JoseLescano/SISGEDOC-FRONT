import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

const base_url: any = environment.HOST+'personalExterno/';

@Injectable({
  providedIn: 'root'
})
export class PersonalExternoService {

  constructor(private http: HttpClient) { }

  getPersonalExterno(){
    const url = base_url + `getPersonalExterno`;
    return this.http.get(url);
  }

  registrarPersonal(personal: any){
    const url = base_url + `registrarPersonal`;
    return this.http.post(url, personal);
  }

  cambiarEstadoPersonal(vid: any){
    const url = base_url + `cambiarEstadoPersonal`;
    return this.http.post(url, vid);
  }

  actualizarPersonal(personal: any){
    const url = base_url;
    return this.http.put(url, personal);
  }

}
