import { Injectable } from '@angular/core';
import { Menu } from '../_model/menu';
import { Subject } from 'rxjs';
import { GenericService } from './generic.service';
import { HttpClient } from '@angular/common/http';
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
    return this.http.get<Menu[]>(`${environment.HOST}menus/getMenuByRol/${rol}`);
  }

}
