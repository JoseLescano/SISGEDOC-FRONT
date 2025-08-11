import { Injectable } from '@angular/core';
import { Organizacion } from '../_model/organizacion';
import { GenericService } from './generic.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { OrganizacionDiagram } from '../_DTO/OrganizacionDiagram';

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

  destinatariosExternoByDecreto(codigoInterno: any, decreto: any){
    let formData: FormData = new FormData();
    formData.append("codigoInterno", codigoInterno);
    formData.append("codigoDecreto", decreto);
    return this.http.post<Organizacion[]>(`${environment.HOST}organizaciones/destinatariosExternoByDecreto`, formData);
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

  getInternos(){
    return this.http.get<Organizacion[]>(`${environment.HOST}organizaciones/getInternos`);
  }

  getWithCodigoCopere(){
    return this.http.get<Organizacion[]>(`${environment.HOST}organizaciones/getWithCodigoCopere`);
  }

  getEntregarCopere(){
    return this.http.get<Organizacion[]>(`${environment.HOST}organizaciones/getEntregarCopere`);
  }

  findForDerivacion(codigoInterno: any){
    return this.http.get<Organizacion[]>(`${environment.HOST}organizaciones/findForDerivacion/${codigoInterno}`);
  }

  findForDiagrama(codigoInterno: any){
    return this.http.get<OrganizacionDiagram[]>(`${environment.HOST}organizaciones/findForDiagrama/${codigoInterno}`);
  }
  getEmu(p?: number, s?: number, sortField?: string, sortDir?: string){
    return this.http.get<OrganizacionDiagram[]>(`${environment.HOST}organizaciones/getDependencias?page=${p}&size=${s}&sort=${sortField},${sortDir}`);
  }

  findByCodigoInterno(codigoInterno: any){
    return this.http.get<Organizacion>(`${environment.HOST}organizaciones/findByCodigoInterno/${codigoInterno}`);
  }

  saveOrganizacion(organizacion: any, codigoPadre: any){

    const headers = { 'content-type': 'application/json'}
    const body=JSON.stringify(organizacion);

    return this.http.post(`${environment.HOST}organizaciones/newChildren/${codigoPadre}`, body, {'headers':headers});
  }

  updateOrganizacion(codigoInterno:any, acronimo:any, nombreLargo:any, indicativo:any, cargo:any, ubigeo:any, emu:any){
    let formData: FormData = new FormData();
    formData.append("acronimo", acronimo);
    formData.append("nombreLargo", nombreLargo);
    formData.append("indicativo", indicativo);
    formData.append("cargo", cargo);
    formData.append("ubigeo", ubigeo);
    formData.append("emu", emu);
    return this.http.put(`${environment.HOST}organizaciones/updateOrganizacion/${codigoInterno}`, formData);
  }

  eliminarOrganizacion(codigoInterno: any){
    return this.http.put(`${environment.HOST}organizaciones/eliminar/${codigoInterno}`, codigoInterno);
  }

  findByDevolver(idDecreto: any){
    let formData: FormData = new FormData();
    formData.append("idDecreto", idDecreto);
    return this.http.post(`${environment.HOST}organizaciones/findByDevolver`, formData);
  }

  getUnidadNucleo(){
    return this.http.get(`${environment.HOST}organizaciones/getUnidadNucleo`);
  }

}
