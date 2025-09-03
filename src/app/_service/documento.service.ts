import { Documento } from './../_model/documento.model';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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
    return this.http.get<Documento[]>(`${environment.HOST}documentos/findByOrganizacionDestino/${codigo}`);
  }

  paginacionDocumento(codigo: string, p?: number, s?: number, sortField?: string, sortDir?: string) {
    return this.http.get<any>(`${environment.HOST}documentos/paginacionDocumento/${codigo}?page=${p}&size=${s}&sort=${sortField},${sortDir}`);
  }

  viewDocumentoFueraTiempo(codigo: string, p?: number, s?: number, sortField?: string, sortDir?: string, fechaInicio?:any, fechaFin?:any) {
    debugger
    let formData:FormData = new FormData();
    formData.append('fechaInicio', fechaInicio);
    formData.append('fechaFin', fechaFin);
    return this.http.post<any>(`${environment.HOST}core/control/${codigo}?page=${p}&size=${s}&sort=${sortField},${sortDir}`, formData);
  }
  
  documentoFueraTiempo(codigo: string, fechaInicio:any, fechaFin:any) {
    let formData:FormData = new FormData();
    formData.append('fechaInicio', fechaInicio);
    formData.append('fechaFin', fechaFin);
    return this.http.post<any>(`${environment.HOST}core/controlChart/${codigo}`, formData);
  }


  findByOrganizacionDestinoForSuperAdm(codigo:any, fi:any, ff:any){
    let formData: FormData= new FormData();
    formData.append('codigoInterno', codigo);
    formData.append('fi', fi);
    formData.append('ff', ff);
    return this.http.post(`${environment.HOST}documentos/findByOrganizacionDestinoForSuperAdm`, formData);
  }

  searchRegistrados(codigo:any, fi:any, ff?:any){
    let formData: FormData= new FormData();
    formData.append('codigoInterno', codigo);
    formData.append('fi', fi);
    formData.append('ff', ff);

    return this.http.post(`${environment.HOST}documentos/searchRegistrados`, formData);
  }

  viewPDF(vidDocumento: any, isAntiguo?:any){
    return this.http.get(`${environment.HOST}documentos/viewPDF/${vidDocumento}`,
      {
        params: {respuestaAntigua: isAntiguo, codigoOrganizacion: sessionStorage.getItem(environment.codigoOrganizacion) }
      });
  }

  verDocumentoRespuesta(codigoDocumentoPadre: any, codigoDecreto:any){
    let formData: FormData= new FormData();
    formData.append('codigoDocumentoPadre', codigoDocumentoPadre);
    formData.append('aux', codigoDecreto);
    return this.http.post(`${environment.HOST}documentos/verDocumentoRespuesta`, formData);
  }

  getDocumentoSeguimiento(vidDocumento: any){
    return this.http.get(`${environment.HOST}documentos/getDocumentoSeguimiento/${vidDocumento}`);
  }

  findRespuestaByVidParent(codigoDocumentoPadre: any, codigoDecreto?:any){
    let formData:FormData = new FormData();
    formData.append('codigoDocumentoPadre', codigoDocumentoPadre);
    formData.append('codigoDecreto', codigoDecreto);
    return this.http.post(`${environment.HOST}documentos/findRespuestaByVidParent`, formData);
  }

  findForCorregir(codigoOrganizacion:any){
    let formData:FormData = new FormData();
    formData.append('codigoInterno', codigoOrganizacion);
    return this.http.post(`${environment.HOST}documentos/findForCorregir`, formData);
  }

  findDecretados1(codigoInterno:any, p?: number, s?: number, sortField?: string, sortDir?: string, fechaI?:any, fechaF?:any){
    let formData:FormData = new FormData();
    formData.append('fi', fechaI);
    formData.append('ff', fechaF);
    return this.http.post(`${environment.HOST}documentos/findDecretados1/${codigoInterno}?page=${p}&size=${s}&sort=${sortField},${sortDir}`, formData);
  }

  findDecretadosForDay(codigoInterno:any, fechaI:any, p?: number, s?: number, sortField?: string, sortDir?: string){
    let formData:FormData = new FormData();
    formData.append('codigoInterno', codigoInterno);
    formData.append('fecha', fechaI);
    debugger
    return this.http.post(`${environment.HOST}documentos/findDecretadosForDay?page=${p}&size=${s}&sort=${sortField},${sortDir}`, formData);
  }

  findArchivadosByOrganizacion(codigoInterno:any){
    return this.http.get<Documento[]>(`${environment.HOST}documentos/findArchivadosByOrganizacion/${codigoInterno}`);
  }

  findDerivadosByOrganizacion(codigoInterno:any){
    return this.http.get<Documento[]>(`${environment.HOST}documentos/findDerivadosByOrganizacion/${codigoInterno}`);
  }

  findRemitidos(codigoInterno:any, p?: number, s?: number, sortField?: string, sortDir?: string, fechaInicio?:any, fechaFin?:any ){
    let formData:FormData = new FormData();
    formData.append('codigoInterno', codigoInterno);
    formData.append('fi', fechaInicio);
    formData.append('ff', fechaFin);
    return this.http.post(`${environment.HOST}documentos/findRemitidos?page=${p}&size=${s}&sort=${sortField},${sortDir}`, formData);
  }

  findDevueltosForOrganizacion(codigoInterno:any, fechaInicio?:any, fechaFin?:any ){
    let formData:FormData = new FormData();
    formData.append('codigoInterno', codigoInterno);
    formData.append('fi', fechaInicio);
    formData.append('ff', fechaFin);
    return this.http.post(`${environment.HOST}documentos/findDevueltosForOrganizacion`, formData);
  }

  searchByOrganizacion(codigoInterno:any, contexto:any, p?: number, s?: number, sortField?: string, sortDir?: string, fechaInicio?:any, fechaFin?:any){
    let formData:FormData = new FormData();
    formData.append('codigoInterno', codigoInterno);
    formData.append('contexto', contexto);
    formData.append('fi', fechaInicio);
    formData.append('ff', fechaFin);
    return this.http.post(`${environment.HOST}documentos/searchByOrganizacion?page=${p}&size=${s}&sort=${sortField},${sortDir}`, formData);
  }

  findEnviadosExternosMP(codigoInterno:any, p?: number, s?: number, sortField?: string, sortDir?: string, fechaI?:any, fechaF?:any){
    let formData : FormData = new FormData();
    formData.append('codigoInterno', codigoInterno);
    formData.append('fi', fechaI);
    formData.append('ff', fechaF);
    return this.http.post(`${environment.HOST}documentos/findEnviadosExternosMP?page=${p}&size=${s}&sort=${sortField},${sortDir}`, formData);
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
    documento.anexos.forEach(file => {
      formData.append('anexo', file);
    });

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
    documento.anexos.forEach(file => {
      formData.append('anexo', file);
    });
    formData.append('organizacionRemitente', documento.organizacionOrigen);
    return this.http.post(`${environment.HOST}core/envioExterno`, formData);
  }

  crearDocumento(documento: any,  nameDocuentoFirmado : any,
     isFirmado:any, anexos?:any, documentoPadre?: any
  ){

    let formData:FormData = new FormData();
    formData.append('clase', documento.clase);
    formData.append('nroOrden', documento.nroOrden);
    formData.append('indicativo', documento.indicativo);
    // formData.append('prioridad', documento.prioridad);
    formData.append('asunto', documento.asunto);
    formData.append('destinos', documento.destinos);
    formData.append('copiasInformativas', documento.copiasInformativas);
    formData.append('archivoPrincipal', documento.archivoPrincipal);
    formData.append('organizacionRemitente', documento.organizacionOrigen);
    anexos.forEach(file => {
      formData.append('anexos', file);
    });
    formData.append('nameArchivoFirmado', nameDocuentoFirmado);
    formData.append('isFirmado', isFirmado);
    formData.append('codigoDocumentoPadre', documentoPadre);

    return this.http.post(`${environment.HOST}documentos/crearDocumento`, formData);
  }

  archivarDocumento(vidDocumento:any, orgOrigen:any, observaciones:any, codigoDecreto: any,url_pdf?:any){
    let formData:FormData = new FormData();
    formData.append('vidDocumento', vidDocumento);
    formData.append('orgOrigen', orgOrigen);
    formData.append('observaciones', observaciones);
    formData.append('codigoDecreto', codigoDecreto);
    formData.append('url_pdf', url_pdf);
    return this.http.post(`${environment.HOST}documentos/archivarDocumento`, formData);
  }

  archivarDocumentoForSuperAdm(codigoInterno:any, listaDecretos: any, usuario:any, observaciones:any){
    let formData:FormData = new FormData();
    formData.append('codigoInterno', codigoInterno);
    formData.append('listaDecretos', listaDecretos);
    formData.append('usuarioSolicitante', usuario);
    formData.append('observacion', observaciones);
    return this.http.post(`${environment.HOST}documentos/archivarDocumentoForSuperAdm`, formData);
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

  findDecretoGraficaByDocumento(codigoInterno:any){
    return this.http.get(`${environment.HOST}documentos/findDecretoGraficaByDocumento/${codigoInterno}`);
  }

  findParaParte(codigoInterno:any, p?: number, s?: number, sortField?: string, sortDir?: string){
    return this.http.get(`${environment.HOST}documentos/findParaParte/${codigoInterno}?page=${p}&size=${s}&sort=${sortField},${sortDir}`);
  }

  findParaParteBySuperADM(codigoInterno:any, fi: any, ff: any){
    let formData:FormData = new FormData();
    formData.append('codigoInterno', codigoInterno);
    formData.append('fi', fi);
    formData.append('ff', ff);
    return this.http.post(`${environment.HOST}documentos/findParaParteBySuperADM`, formData);
  }

  convertFileToPDF (file: any) {
    let formData: FormData = new FormData();
    formData.append('files', file);
    return this.http.post(`${environment.HOST}documentos/convertFileToPDF`, formData);
  }

  firmarDocumento(file: any) {
    let formData: FormData = new FormData();
    formData.append('files', file);
    formData.append('access_token', sessionStorage.getItem('access_token') || environment.TOKEN_NAME);  // Pass access_token
    return this.http.post(`${environment.HOST}documentos/firmarDocumentoPeru`, formData);
  }

  crearDocumentoParaFirmar(documento: any, organizacionRemitente:any, word?:any){
    debugger
    let formData:FormData = new FormData();
    formData.append('clase', documento.clase);
    formData.append('nroOrden', documento.nroOrden);
    formData.append('indicativo', documento.indicativo);
    formData.append('prioridad', documento.prioridad);
    formData.append('asunto', documento.asunto);
    formData.append('destinos', documento.destinos);
    formData.append('copiasInformativas', documento.copiasInformativas);
    formData.append('archivoPrincipal', documento.archivoPrincipal);
    documento.anexos.forEach(item => {
      formData.append('anexo', item);
    });
    formData.append('organizacionOrigen', documento.organizacionOrigen);
    formData.append('organizacionRemitente', organizacionRemitente);
    formData.append('word', word);
    // formData.append('prioridad', documento.prioridad);
    return this.http.post(`${environment.HOST}documentos/remitirDocumentoForFirma`, formData);
  }

  crearRespuestaParaFirmar(documento: any, organizacionRemitente:any,
    codigoDocumentoPadre:any, nameDocuentoFirmado: any, isFirmado: any, codigoDecreto: any, anexos?:any){
    let formData:FormData = new FormData();
    formData.append('clase', documento.clase);
    formData.append('nroOrden', documento.nroOrden);
    formData.append('indicativo', documento.indicativo);
    //formData.append('prioridad', documento.prioridad);
    formData.append('asunto', documento.asunto);
    formData.append('destinos', documento.destinos);
    formData.append('copiasInformativas', documento.copiasInformativas);
    formData.append('archivoPrincipal', documento.archivoPrincipal);
    anexos.forEach(item => {
      formData.append('anexo', item);
    });
    formData.append('organizacionOrigen', documento.organizacionOrigen);
    formData.append('organizacionRemitente', organizacionRemitente);
    formData.append('codigoDocumentoPadre', codigoDocumentoPadre);
    formData.append('nameArchivoFirmado', nameDocuentoFirmado);
    formData.append('isFirmado', isFirmado);
    formData.append('codigoDecreto', codigoDecreto);
    debugger;
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

  findArchivados1ByOrganizacion(codigoInterno:any,
    p?: number, s?: number, sortField?: string, sortDir?: string,
    fechaInicio?:any, fechaFin?:any){
    debugger
    let formData:FormData = new FormData();
    formData.append('codigoOrganizacion', codigoInterno);
    formData.append('fi', fechaInicio);
    formData.append('ff', fechaFin);
    return this.http.post(`${environment.HOST}documentos/findArchivados1ByOrganizacion?page=${p}&size=${s}&sort=${sortField},${sortDir}`, formData);
  }

  findArchivadosByContexto(contexto:any){
    let formData:FormData = new FormData();
    formData.append('contexto', contexto);
    return this.http.post(`${environment.HOST}documentos/findArchivadosByContexto`, formData);
  }

  findElevados(codigoInterno:any, fechaInicio?:any, fechaFin?:any ){
    let formData:FormData = new FormData();
    formData.append('codigoInterno', codigoInterno);
    formData.append('fi', fechaInicio);
    formData.append('ff', fechaFin);
    return this.http.post(`${environment.HOST}documentos/findElevados`, formData);
  }

  downloadWord(codigoDocumento:any){
    let formData:FormData = new FormData();
    formData.append('codigoDocumento', codigoDocumento);
    return this.http.post(`${environment.HOST}documentos/downloadWord`, formData);
  }

  existByDocumento(codigoDocumento:any){
    let formData:FormData = new FormData();
    formData.append('codigoDocumento', codigoDocumento);
    return this.http.post(`${environment.HOST}documentos/existByDocumento`, formData);
  }

  findDecretadoForBarChart(codigoOrganizacion:any){
    let formData:FormData = new FormData();
    formData.append('codigoOrganizacion', codigoOrganizacion);
    return this.http.post(`${environment.HOST}documentos/findDecretadoForBarChart`, formData);
  }

  getDecretados7dias(codigoOrganizacion:any){
    let formData:FormData = new FormData();
    formData.append('codigoOrganizacion', codigoOrganizacion);
    return this.http.post(`${environment.HOST}documentos/getDecretados7dias`, formData);
  }

  getDocumentoBandejaNucleo(){
    return this.http.get(`${environment.HOST}documentos/getDocumentoBandejaNucleo`);
  }

  getDocumentoBandejaBySuperAdm(codigoInterno:string){
    let formData:FormData = new FormData();
    formData.append('codigoInterno', codigoInterno);
    return this.http.post(`${environment.HOST}documentos/getDocumentoBandejaBySuperAdm`, formData);
  }

  reportDecretados(origen:any, fechaInicio: any, fechaFin: any){

    let formData:FormData = new FormData();
    formData.append('idOrganizacion', origen);
    formData.append('fechaInicio',fechaInicio);
    formData.append('fechafin', fechaFin);

    return this.http.post(`${environment.HOST}documentos/reportDecretados`,
      formData);
  }

  registrarVisualizacion(vidDocumento:any, orgOrganizacion:any){
    let formData:FormData = new FormData();
    formData.append('codigoDocumento', vidDocumento);
    formData.append('codigoOrganizacion', orgOrganizacion);
    return this.http.post(`${environment.HOST}documentoVisualizados/registrarVisualizacion`, formData);
  }

  findDevueltosByOrganizacion(codigoInterno:any){
    let formData:FormData = new FormData();
    formData.append('codigoInterno', codigoInterno);
    return this.http.post(`${environment.HOST}documentos/findDevueltosByOrganizacion`, formData);
  }

  findBySuperAdm(campo:any, p?: number, s?: number, sortField?: string, sortDir?: string){
    let formData:FormData = new FormData();
    formData.append('campo', campo);
    return this.http.post(`${environment.HOST}documentos/findBySuperAdm?page=${p}&size=${s}&sort=${sortField},${sortDir}`, formData);
  }

  countStadisticForSuperADM(codigoInterno:any){
    let formData:FormData = new FormData();
    formData.append('codigoInterno', codigoInterno);
    return this.http.post(`${environment.HOST}documentos/countStadisticForSuperADM`, formData);
  }

}
