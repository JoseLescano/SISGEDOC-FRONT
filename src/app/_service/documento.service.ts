import { Documento } from './../_model/documento.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  findById(codigoDocumento: any){
    return this.http.get<Documento>(`${environment.HOST}documentos/findById/${codigoDocumento}`);
  }

  findByOrganizacionDestino(codigo:any){
    let token = sessionStorage.getItem(environment.TOKEN_NAME);
    return this.http.get<Documento[]>(`${environment.HOST}documentos/findByOrganizacionDestino/${codigo}`, {
      headers: new HttpHeaders()
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/json'),
    });
  }

  viewPDF(vidDocumento: any){
    return this.http.get(`${environment.HOST}documentos/viewPDF/${vidDocumento}`);
  }

  getDocumentoSeguimiento(vidDocumento: any){
    return this.http.get(`${environment.HOST}documentos/getDocumentoSeguimiento/${vidDocumento}`);
  }

  findRespuestaByVidParent(codigoDocumentoPadre: any){
    return this.http.get(`${environment.HOST}documentos/findRespuestaByVidParent/${codigoDocumentoPadre}`);
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
    formData.append('organizacionPartida', documento.organizacionPartida);
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

  crearDocumento(documento: any, anexos?:any
    // , documentoPadre: any
  ){
    
    let formData:FormData = new FormData();
    formData.append('clase', documento.clase);
    formData.append('nroOrden', documento.nroOrden);
    formData.append('indicativo', documento.indicativo);
    formData.append('prioridad', documento.prioridad);
    formData.append('asunto', documento.asunto);
    formData.append('destinos', documento.destinos);
    formData.append('copiasInformativas', documento.copiasInformativas);
    formData.append('archivoPrincipal', documento.archivoPrincipal);
    formData.append('organizacionRemitente', documento.organizacionOrigen);
    // formData.append('documentoPadre', documentoPadre);
    debugger;
    for (let index = 0; index < anexos.length; index++) {
      let element = anexos.item(index);
      formData.append('anexos', element);
    }
    
    return this.http.post(`${environment.HOST}documentos/crearDocumento`, formData);
  }

  archivarDocumento(vidDocumento:any, orgOrigen:any, observaciones:any,url_pdf?:any){
    debugger;
    let formData:FormData = new FormData();
    formData.append('vidDocumento', vidDocumento);
    formData.append('orgOrigen', orgOrigen);
    formData.append('observaciones', observaciones);
    formData.append('url_pdf', url_pdf);
    return this.http.post(`${environment.HOST}documentos/archivarDocumento`, formData);
  }

  generarPlantillaWord(tipo_documento:any, asunto: any, uu_destino: any, uu_origen: any,
    fr_indicativo: any, fr_correlativo: any, fr_copia_informativa ?: any
  ){
    let formData: FormData = new FormData();
    formData.append('tipo_documento', tipo_documento);
    formData.append('asunto', asunto);
    formData.append('uu_destino', uu_destino);
    formData.append('uu_origen', uu_origen);
    formData.append('fr_indicativo', fr_indicativo);
    formData.append('fr_correlativo', fr_correlativo);
    formData.append('fr_copia_informativa', fr_copia_informativa==null? new Array():fr_copia_informativa);
    return this.http.post(`${environment.HOST}documentos/generarWordPlantilla`, formData);
  }

  findDecretoByDocumento(codigoInterno:any){
    return this.http.get(`${environment.HOST}documentos/findDecretoByDocumento/${codigoInterno}`);
  }

  findParaParte(codigoInterno:any){
    return this.http.get(`${environment.HOST}documentos/findParaParte/${codigoInterno}`);
  }

  convertFileToPDF (file: any) {
    let formData: FormData = new FormData();
    formData.append('files', file);
    return this.http.post(`${environment.HOST}documentos/convertFileToPDF`, formData);
  }

  firmarDocumento(file: any){
    let formData: FormData = new FormData();
    formData.append('files', file);
    // formData.append('param_token', "1626476967");
    // formData.append("document_extension","pdf")
    return this.http.post(`${environment.HOST}documentos/firmarDocumentoPeru`, formData);
  }

  crearDocumentoParaFirmar(documento: any, organizacionRemitente:any){
    debugger;
    let formData:FormData = new FormData();
    formData.append('clase', documento.clase);
    formData.append('nroOrden', documento.nroOrden);
    formData.append('indicativo', documento.indicativo);
    formData.append('prioridad', documento.prioridad);
    formData.append('asunto', documento.asunto);
    formData.append('destinos', documento.destinos);
    formData.append('copiasInformativas', documento.copiasInformativas);
    formData.append('archivoPrincipal', documento.archivoPrincipal);
    formData.append('anexo', documento.anexos);
    formData.append('organizacionOrigen', documento.organizacionOrigen);
    formData.append('organizacionRemitente', organizacionRemitente);
    return this.http.post(`${environment.HOST}documentos/remitirDocumentoForFirma`, formData);
  }

  crearRespuestaParaFirmar(documento: any, organizacionRemitente:any, codigoDocumentoPadre:any){
    debugger;
    let formData:FormData = new FormData();
    formData.append('clase', documento.clase);
    formData.append('nroOrden', documento.nroOrden);
    formData.append('indicativo', documento.indicativo);
    formData.append('prioridad', documento.prioridad);
    formData.append('asunto', documento.asunto);
    formData.append('destinos', documento.destinos);
    formData.append('copiasInformativas', documento.copiasInformativas);
    formData.append('archivoPrincipal', documento.archivoPrincipal);
    formData.append('anexo', documento.anexos);
    formData.append('organizacionOrigen', documento.organizacionOrigen);
    formData.append('organizacionRemitente', organizacionRemitente);
    formData.append('codigoDocumentoPadre', codigoDocumentoPadre);
    return this.http.post(`${environment.HOST}documentos/remitirRespuestaForFirma`, formData);
  }

  getFileDocumentKeyDigital(nameFile: any) {
    let token = sessionStorage.getItem(environment.TOKEN_NAME);
    return this.http.get(`${environment.HOST}documentos/getFileDocumentKeyDigital/${nameFile}`, {
      headers: new HttpHeaders()
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/json'),
    });
  }

  contadoresDashboard(codigoOrganizacion:any){
    return this.http.get(`${environment.HOST}documentos/contadoresDashboard/${codigoOrganizacion}`);
  }

}
