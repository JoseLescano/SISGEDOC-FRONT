import { Injectable } from '@angular/core';
import { Organizacion } from '../_model/organizacion';
import { GenericService } from './generic.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrganizacionService extends GenericService<Organizacion> {

  private organizacionCambio = new Subject<Organizacion[]>();

  constructor(protected override http: HttpClient) {
    super(http, `${environment.HOST}organizaciones/`)
  }

  setOrganizacionCambio(data:Organizacion[]){
    this.organizacionCambio.next(data);
  }

  getOrganizacionCambio(){
    return this.organizacionCambio.asObservable();
  }

  findFirmantes(codigoInterno: any){
    return this.http.get<Organizacion[]>(`${environment.HOST}organizaciones/findFirmantes/${codigoInterno}`);
  }

  destinatariosExternoByCodigo(codigoInterno: any, tipoDocumento: any){
    return this.http.get<Organizacion[]>(`${environment.HOST}organizaciones/destinatariosExternoByCodigo`,
      { params: 
        { codigoInterno: codigoInterno, tipoDocumento:tipoDocumento }
      });
  }

  getRemitentesInterno(){
    return this.http.get<Organizacion[]>(`${environment.HOST}organizaciones/getRemitentesInterno`);
  }

  getChildrenByCodigo(codigoInterno:any){
    return this.http.get<Organizacion[]>(`${environment.HOST}organizaciones/getChildrenByCodigo/${codigoInterno}`);
  }

  getChildrenAllByCodigo(codigoInterno:any){
    return this.http.get<Organizacion[]>(`${environment.HOST}organizaciones/getChildrenAllByCodigo/${codigoInterno}`);
  }

  getAllExternas(){
    return this.http.get<Organizacion[]>(`${environment.HOST}organizaciones/getAllExternas`);
  }

  getWithCodigoCopere(){
    return this.http.get<Organizacion[]>(`${environment.HOST}organizaciones/getWithCodigoCopere`);
  }

  findForDerivacion(codigoInterno: any){
    return this.http.get<Organizacion[]>(`${environment.HOST}organizaciones/findForDerivacion/${codigoInterno}`);
  }

}
