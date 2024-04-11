import { Injectable } from '@angular/core';
import { Perfil } from '../_model/perfil';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GenericService } from './generic.service';

@Injectable({
  providedIn: 'root'
})
export class PerfilService extends GenericService<Perfil> {

  private perfilCambio = new Subject<Perfil[]>();

  constructor(protected override http: HttpClient) {
    super(http, `${environment.HOST}perfiles`)
  }

  setPerfilCambio(data:Perfil[]){
    this.perfilCambio.next(data);
  }

  getPerfilCambio(){
    return this.perfilCambio.asObservable();
  }

  findByUsuario(usuario: any){
    return this.http.get<Perfil[]>(`${environment.HOST}perfiles/findByUsuario`, { params: { usuario: usuario }} );
  }


}
