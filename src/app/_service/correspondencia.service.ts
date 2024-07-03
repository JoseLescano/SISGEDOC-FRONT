import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { Correspondencia } from '../_model/correspondencia';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CorrespondenciaOP } from '../_DTO/CorrespondenciaOP';

@Injectable({
  providedIn: 'root'
})
export class CorrespondenciaService extends GenericService<Correspondencia> {

  private correspondenciaCambio = new Subject<Correspondencia[]>();

  constructor(protected override http: HttpClient) {
    super(http, `${environment.HOST}correspondencias`)
  }

  findByOrganizacionDestino(orgDestino: any){
    return this.http.get<Correspondencia[]>(`${environment.HOST}correspondencias/findByOrganizacionDestino/${orgDestino}`);
  }

  listEntregarByOP(orgDestino: any){
    return this.http.get<Correspondencia[]>(`${environment.HOST}correspondencias/listEntregarByOP/${orgDestino}`);
  }

  correspondenciaOP(correspondencia: CorrespondenciaOP){
    debugger;
    let formData:FormData = new FormData();
    formData.append('origen', correspondencia.origen);
    formData.append('destino', correspondencia.destino);
    formData.append('fechaDocumento', environment.convertDateToStr(correspondencia.fechaRegistro));
    formData.append('clase', correspondencia.clase);
    formData.append('nroSobre', correspondencia.nroSobre);
    formData.append('folio', correspondencia.folio);
    formData.append('asunto', correspondencia.asunto);
    formData.append('observaciones', correspondencia.observaciones);

    return this.http.post(`${environment.HOST}correspondencias/correspondenciaOP`, formData);
  }

  entregaCorrespondencia(origen:any, usuarioRecibe:any, 
    contrasena:any, correspondencias:Correspondencia[]){
    debugger;
    let formData:FormData = new FormData();
    formData.append('origen', origen);
    formData.append('usuarioRecibe',usuarioRecibe);
    formData.append('contrasena', contrasena);
    correspondencias.forEach(item => {
      formData.append('correspondencias', item.codigo.toString());
    })

    return this.http.post(`${environment.HOST}correspondencias/entregaCorrespondencia`, formData);
  }


}
