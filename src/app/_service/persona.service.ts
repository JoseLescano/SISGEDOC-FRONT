import { Injectable } from '@angular/core';
import { Persona } from '../_model/persona';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GenericService } from './generic.service';

@Injectable({
  providedIn: 'root'
})
export class PersonaService extends GenericService<Persona> {

  private personaCambio = new Subject<Persona[]>();

  constructor(protected override http: HttpClient) {
    super(http, `${environment.HOST}personas/`)
  }

  setPersonaCambio(data:Persona[]){
    this.personaCambio.next(data);
  }

  getPersonaCambio(){
    return this.personaCambio.asObservable();
  }

  findByCampo(campo: any){
    return this.http.get<Persona[]>(`${environment.HOST}personas/findByCampo`, { params: { valor: campo }} );
  }

  resetearByCampo(valor:any){
    return this.http.delete(`${environment.HOST}dobleAuthe/resetearByCampo/${valor}`);
  }

}
