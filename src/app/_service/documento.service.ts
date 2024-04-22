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
    return this.http.get<Documento[]>(`${environment.HOST}documentos/findDecretados`, { params: { codigoInterno: codigoOrganizacion, fi:fechaI, ff:fechaF }});
  }

  findArchivadosByOrganizacion(codigoInterno:any){
    return this.http.get<Documento[]>(`${environment.HOST}documentos/findArchivadosByOrganizacion/${codigoInterno}`);
  }

  findDerivadosByOrganizacion(codigoInterno:any){
    return this.http.get<Documento[]>(`${environment.HOST}documentos/findDerivadosByOrganizacion/${codigoInterno}`);
  }

  recibirDocumentoMP(documento: any){
    debugger;
    // let formData:FormData = new FormData();
    // formData.append('tipoOrganizacion', documento.tipoOrganizacion);
    // formData.append('organizacionOrigen', documento.organizacionOrigen);
    // formData.append('clase', documento.clase);
    // formData.append('nroOrden', documento.nroOrden);
    // formData.append('indicativo', documento.indicativo);
    // formData.append('claveIndicativo', documento.claveIndicativo);
    // formData.append('prioridad', documento.prioridad);
    // formData.append('fechaDocumento', environment.convertStringToDateBD(documento.fechaDocumento));
    // formData.append('folio', documento.folio);
    // formData.append('asunto', documento.asunto);
    // formData.append('destinos', destino);
    // formData.append('copiasInformativas', copiasInformativas);
    // formData.append('archivoPrincipal', archivoPrincipal);
    // formData.append('anexo', anexos);
    return this.http.post(`${environment.HOST}documentos/recibirDocumentoMP`, documento);
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

  findDecretoByDocumento(codigoInterno:any){
    return this.http.get(`${environment.HOST}documentos/findDecretoByDocumento/${codigoInterno}`);
  }

}
