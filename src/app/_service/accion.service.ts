import { Injectable } from '@angular/core';
import { Accion } from '../_model/accion';
import { Subject } from 'rxjs';
import { GenericService } from './generic.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccionService extends GenericService<Accion> {

  private accionCambio = new Subject<Accion[]>();

  constructor(protected override http: HttpClient) {
    super(http, `${environment.HOST}acciones`)
  }


  setAccionCambio(data : Accion[]){
      this.accionCambio.next(data);
  }

  getAccionCambio(){
    return this.accionCambio.asObservable();
  }



}
