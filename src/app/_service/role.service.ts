import { Injectable } from '@angular/core';
import { Rol } from '../_model/rol';
import { GenericService } from './generic.service';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoleService extends GenericService<Rol> {

  private rolCambio = new Subject<Rol[]>();

  constructor(protected override http: HttpClient) {
    super(http, `${environment.HOST}roles`)
  }

  findForUsuario(){
    return this.http.get<Rol[]>(`${environment.HOST}roles/findForUsuario`);
  }

}
