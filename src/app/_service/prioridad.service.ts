import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { Prioridad } from '../_model/prioridad';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PrioridadService extends GenericService<Prioridad> {

  private prioridadCambio = new Subject<Prioridad[]>();

  constructor(protected override http: HttpClient) {
    super(http, `${environment.HOST}prioridades`);
  }

  setPrioridadCambio(data:Prioridad[]){
    this.prioridadCambio.next(data);
  }

  getPrioridadCambio(){
    return this.prioridadCambio.asObservable();
  }

}
