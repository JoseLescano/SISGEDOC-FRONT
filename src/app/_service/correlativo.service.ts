import { Injectable } from '@angular/core';
import { Correlativo } from '../_model/correlativo';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { GenericService } from './generic.service';

@Injectable({
  providedIn: 'root'
})
export class CorrelativoService extends GenericService<Correlativo> {

  private correlativoCambio = new Subject<Correlativo[]>();

  constructor(protected override http: HttpClient) {
    super(http, `${environment.HOST}correlativos`)
  }

  setCorrelativoCambio(data:Correlativo[]){
    this.correlativoCambio.next(data);
  }

  getCorrelativoCambio(){
    return this.correlativoCambio.asObservable();
  }

  findClaseAndOrganizacion(clase: any, organizacion: any){
    return this.http.get(`${environment.HOST}correlativos/findClaseAndOrganizacion`,
      {
        params: { clase: clase, organizacion: organizacion}
      });
  }

}
