import { Injectable } from '@angular/core';
import { DobleAutentificacion } from '../_model/dobleAutentificacion';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { GenericService } from './generic.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DobleAutentificacionService  extends GenericService<DobleAutentificacion> {

  private DobleAutentificacionCambio = new Subject<DobleAutentificacion[]>();

  constructor(protected override http: HttpClient) {
    super(http, `${environment.HOST}dobleAuthe/`)
   }

  setDobleAutentificacionCambio(data:DobleAutentificacion[]){
    this.DobleAutentificacionCambio.next(data);
  }

  getDobleAutentificacionCambio(){
    this.DobleAutentificacionCambio.asObservable();
  }

  resetearByCampo(chasqui:any){
    return this.http.delete(`${environment.HOST}dobleAuthe/resetearByCampo/${chasqui}`);
  }

}
