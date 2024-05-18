import { Documento } from './../_model/documento.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { GenericService } from './generic.service';
import { DocumentoArchivoAnexo } from '../_DTO/DocumentoArchivoAnexo';

@Injectable({
  providedIn: 'root'
})
export class DocumentoService  extends GenericService<Documento> {

  private DocumentoCambio  = new Subject<Documento[]>();

  constructor(protected override http: HttpClient) {
    super(http, `${environment.HOST}documentos/`)
   }

  setDocumentoCambio(data: Documento[]){
    this.DocumentoCambio.next(data);
  }

  getDocumentoCambio(){
    return this.DocumentoCambio.asObservable();
  }

  findByOrganizacionDestino(codigo:any){
    return this.http.get<Documento[]>(`${environment.HOST}documentos/findByOrganizacionDestino/${codigo}`);
  }

  viewPDF(vidDocumento: any){
    return this.http.get(`${environment.HOST}documentos/viewPDF/${vidDocumento}`);
  }

  findRecibosMP(codigoOrganizacion){
    return this.http.get<Documento[]>(`${environment.HOST}documentos/findRecibosMP/${codigoOrganizacion}`);
  }

  findDecretados(codigoOrganizacion:any, fechaI?:any, fechaF?:any){
    return this.http.get<Documento[]>(`${environment.HOST}documentos/findDecretados`,
      { params: { codigoInterno: codigoOrganizacion, fi:fechaI, ff:fechaF }});
  }

  findArchivadosByOrganizacion(codigoInterno:any){
    return this.http.get<Documento[]>(`${environment.HOST}documentos/findArchivadosByOrganizacion/${codigoInterno}`);
  }

  findDerivadosByOrganizacion(codigoInterno:any){
    return this.http.get<Documento[]>(`${environment.HOST}documentos/findDerivadosByOrganizacion/${codigoInterno}`);
  }

  findRemitidos(codigoInterno:any){
    return this.http.get<Documento[]>(`${environment.HOST}documentos/findRemitidos/${codigoInterno}`);
  }

  findEnviadosExternosMP(codigoInterno:any){
    return this.http.get<Documento[]>(`${environment.HOST}documentos/findEnviadosExternosMP/${codigoInterno}`);
  }

  recibirDocumentoMP(documento: any){
    let formData:FormData = new FormData();
    formData.append('tipoOrganizacion', documento.tipoOrganizacion);
    formData.append('organizacionOrigen', documento.organizacionOrigen);
    formData.append('clase', documento.clase);
    formData.append('nroOrden', documento.nroOrden);
    formData.append('indicativo', documento.indicativo);
    formData.append('claveIndicativo', documento.claveIndicativo);
    formData.append('prioridad', documento.prioridad);
    formData.append('fechaDocumento', environment.convertDateToStr(documento.fechaDocumento));
    formData.append('folio', documento.folio);
    formData.append('asunto', documento.asunto);
    formData.append('destinos', documento.destinos);
    formData.append('copiasInformativas', documento.copiasInformativas);
    formData.append('archivoPrincipal', documento.archivoPrincipal);
    formData.append('anexo', documento.anexos);
    return this.http.post(`${environment.HOST}documentos/recibirDocumentoMP`, formData);
  }

  envioExterno(documento: any){
    let formData:FormData = new FormData();
    formData.append('clase', documento.clase);
    formData.append('nroOrden', documento.nroOrden);
    formData.append('indicativo', documento.indicativo);
    formData.append('claveIndicativo', documento.claveIndicativo);
    formData.append('prioridad', documento.prioridad);
    formData.append('fechaDocumento', environment.convertDateToStr(documento.fechaDocumento));
    formData.append('folio', documento.folio);
    formData.append('asunto', documento.asunto);
    formData.append('destinos', documento.destinos);
    formData.append('copiasInformativas', documento.copiasInformativas);
    formData.append('archivoPrincipal', documento.archivoPrincipal);
    formData.append('anexo', documento.anexos);
    formData.append('organizacionRemitente', documento.organizacionOrigen);
    return this.http.post(`${environment.HOST}documentos/envioExterno`, formData);
  }

  archivarDocumento(vidDocumento:any, orgOrigen:any,usuario:any, observaciones:any,url_pdf?:any){
    let formData:FormData = new FormData();
    formData.append('vidDocumento', vidDocumento);
    formData.append('orgOrigen', orgOrigen);
    formData.append('usuario', usuario);
    formData.append('observaciones', observaciones);
    formData.append('url_pdf', url_pdf);
    return this.http.post(`${environment.HOST}documentos/archivarDocumento`, formData);
  }

  generarPlantillaWord(tipo_documento:any, asunto: any, uu_destino: any, uu_origen: any,
    fr_indicativo: any, fr_correlativo: any, fr_copia_informativa ?: any
  ){

    return this.http.get(`${environment.HOST}documentos/generarWordPlantilla`,
    { params: { tipo_documento: tipo_documento, asunto:asunto, uu_destino:uu_destino,
      uu_origen: uu_origen, fr_indicativo: fr_indicativo, fr_correlativo: fr_correlativo,
      fr_copia_informativa: fr_copia_informativa
     }});
  }

  findDecretoByDocumento(codigoInterno:any){
    return this.http.get(`${environment.HOST}documentos/findDecretoByDocumento/${codigoInterno}`);
  }

  findParaParte(codigoInterno:any){
    return this.http.get(`${environment.HOST}documentos/findParaParte/${codigoInterno}`);
  }

}
