import { Injectable } from '@angular/core';
import { CorrecionDTO } from '../_DTO/CorrecionDTO';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { GenericService } from './generic.service';

@Injectable({
  providedIn: 'root'
})
export class CorrecionService extends GenericService<CorrecionDTO> {

  private correcionCambio = new Subject<CorrecionDTO[]>();

  constructor(protected override http: HttpClient) {
    super(http, `${environment.HOST}correciones`)
  }

  findByDecreto(idDecreto: any){
    return this.http.get(`${environment.HOST}correciones/findByDecreto/${idDecreto}`);
  }


  registrarCorrecion(idDocumento:any, idDecreto: any, observacion: any){
    debugger;
    let formData: FormData = new FormData();
    formData.append('idDocumento', idDocumento);
    formData.append('idDecreto', idDecreto);
    formData.append('observacion', observacion);
    return this.http.post(`${environment.HOST}correciones/registrarCorrecion`, formData);
  }

}
