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

  recibirDocumentoMP(documentoDTO: DocumentoArchivoAnexo){
    return this.http.post(`${environment.HOST}documentos/recibirDocumentoMP`, documentoDTO);
  }

}
