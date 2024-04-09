import { Injectable } from '@angular/core';
import { Clase } from '../_model/clase';
import { GenericService } from './generic.service';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClaseService extends GenericService<Clase> {

  private claseCambio = new Subject<Clase[]>();

  constructor(protected override http: HttpClient) {
    super(http, `${environment.HOST}clases`)
  }

  setClaseCambio(data : Clase[]){
    this.claseCambio.next(data);
  }

  getClaseCambio(){
    return this.claseCambio.asObservable();
  }

  findByOrganizacionDestino(){
    return this.http.get<Clase[]>(`${environment.HOST}clases/findForCrearDocumento`);
  }

}
