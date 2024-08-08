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

  private respuestaCambio =  new Subject<DocumentoRespuesta[]>();

  constructor(protected override http: HttpClient) {
    super(http, `${environment.HOST}documentoRespuestas/`)
  }

  setRespuestaCambio(data: DocumentoRespuesta[]){
    this.respuestaCambio.next(data);
  }

  getRespuestaCambio(){
    return this.respuestaCambio.asObservable();
  }

  viewPDF(vidDocumento:any, codigoDestino:any){
    return this.http.get<DocumentoRespuesta[]>(`${environment.HOST}documentoRespuestas/viewPDF`,
      { params: {
        vidDocumento: vidDocumento,
        codigoDestino: codigoDestino
      }});
  }

  viewPDFByDecreto(vidDecreto:number){
    return this.http.get(`${environment.HOST}documentoRespuestas/viewPDFByDecreto`,
      { params: {
        vidDecreto: vidDecreto
      }});
  }

  corregirDocumento(idDecreto:any, archivo: any, observacion:any){
    let formData: FormData = new FormData();
    formData.append('idDecreto', idDecreto);
    formData.append('archivo', archivo);
    formData.append('observacion', observacion);

    return this.http.post(`${environment.HOST}documentoRespuestas/corregirDocumento`, formData);
  }



}
