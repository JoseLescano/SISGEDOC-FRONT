import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { DocumentoRespuesta } from '../_model/documentoRespuesta';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentoRespuestaService extends GenericService<DocumentoRespuesta> {

  private DocumentoRespuestaCambio =  new Subject<DocumentoRespuesta[]>();

  constructor(protected override http: HttpClient) {
    super(http, `${environment.HOST}documentoRespuestas/`)
  }

  setDocumentoRespuestaCambio(data: DocumentoRespuesta[]){
    this.DocumentoRespuestaCambio.next(data);
  }

  getDocumentoRespuestaCambio(){
    return this.DocumentoRespuestaCambio.asObservable();
  }

  viewPDF(vidDocumento:any, codigoDestino:any){
    return this.http.get<DocumentoRespuesta[]>(`${environment.HOST}documentoRespuestas/viewPDF`, 
      { params: { 
        vidDocumento: vidDocumento, 
        codigoDestino: codigoDestino 
      }});
  }



}
