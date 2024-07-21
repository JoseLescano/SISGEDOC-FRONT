import { Injectable } from '@angular/core';
import { Perfil } from '../_model/perfil';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
    let token = sessionStorage.getItem(environment.TOKEN_NAME);
    return this.http.get<Perfil[]>(`${environment.HOST}perfiles/findByUsuario`, {
      headers: new HttpHeaders()
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/json'),
     params: { usuario: usuario }} );
  }

  findByUsuariLogueado(){
    return this.http.get<Perfil[]>(`${environment.HOST}perfiles/findByUsuarioLogueado`);
  }

  findByOrganizacion(codigoInterno: any){

    return this.http.get<Perfil[]>(`${environment.HOST}perfiles/findByOrganizacion/${codigoInterno}`);
  }

  registrarPerfil(codigoOrganizacion:any, usuario:any, puesto:any, rol:any){
    let formData: FormData = new FormData();
    formData.append('codigoOrganizacion', codigoOrganizacion);
    formData.append('usuario', usuario);
    formData.append('puesto', puesto);
    formData.append('rol', rol);
    return this.http.post<Perfil>(`${environment.HOST}perfiles/registrarPerfil`, formData );
  }

  eliminarPerfil(codigo:any){
    return this.http.delete(`${environment.HOST}perfiles/eliminar/${codigo}`);
  }

  // loginActiveDirectory(usuario: any, password: any){
  //   let formData : FormData = new FormData();
  //   formData.append('usuario', usuario);
  //   formData.append('password', password);
  //   return this.http.post(`${environment.HOST}usuarios`,  formData );
  // }


}
