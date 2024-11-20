import { Injectable } from '@angular/core';
import { Menu } from '../_model/menu';
import { Subject } from 'rxjs';
import { GenericService } from './generic.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MenuService extends GenericService<Menu> {

  private menuCambio = new Subject<Menu[]>();

  constructor(protected override http: HttpClient) {
    super(http, `${environment.HOST}menus`)
  }

  getMenuByRol(rol:any){
    let formData: FormData = new FormData();
    formData.append('codigoOrganizacion', sessionStorage.getItem(environment.codigoOrganizacion));
    return this.http.post<Menu[]>(`${environment.HOST}menus/getMenuByRol/${rol}`, formData);
  }

  getMenuChange(){
    return this.menuCambio.asObservable();
  }

  setMenuChange(menus: Menu[]){
    this.menuCambio.next(menus);
  }

}
