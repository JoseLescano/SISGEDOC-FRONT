import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { Decreto } from '../_model/decreto';
import { Observable, Subject } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { DecretoDTO } from '../_DTO/DecretoDTO';
import { DecretoDocumentoDTO } from '../_DTO/DecretoDocumentoDTO';

@Injectable({
  providedIn: 'root'
})
export class DecretoService extends GenericService<Decreto> {

  private decretoCambio = new Subject<Decreto[]>();

  constructor(protected override http: HttpClient) {
    super(http, `${environment.HOST}decretos`)
  }

  ultimoDecreto(codigoDocumento:any, codigoDestino:any){
    return this.http.get<Decreto>(`${environment.HOST}decretos/ultimoDecreto`,
      { params:
        { codigoDocumento: codigoDocumento, codigoDestino:codigoDestino }
      });
  }

  decretarDocumento(decretoDocumento: DecretoDocumentoDTO): Observable<any>{
    return this.http.post(`${environment.HOST}decretos/decretarDocumento`,  decretoDocumento);
  }


  devolverDocumento(documento: any, origen: any, observacion:any){
    let formData: FormData= new FormData();
    formData.append('codigoDocumento', documento);
    formData.append('codigoOrigen', origen);
    formData.append('observacion', observacion);
    return this.http.post(`${environment.HOST}decretos/devolverDocumento`,  formData);

  }

  derivarDocumento(documento: any, origen: any, destino:any, observacion:any){
    let formData: FormData= new FormData();
    formData.append('codigoDocumento', documento);
    formData.append('origen', origen);
    formData.append('destino', destino);
    formData.append('observacion', observacion);
    return this.http.post(`${environment.HOST}decretos/derivarDocumento`,  formData);
    }

    elevarDocumento(documento: any, origen: any, archivoFirmado?:any, documentoRespuesta?:any){
      let formData: FormData= new FormData();
      formData.append('codigoDocumento', documento);
      formData.append('origen', origen);
      formData.append('archivoFirmado', archivoFirmado);
      formData.append('documentoRespuesta', documentoRespuesta);
    return this.http.post(`${environment.HOST}decretos/elevarDocumento`,  formData);
  }

  distrubirDocumento(documento: any, origen: any,nameDocuentoFirmado : any, isFirmado:any, archivoFirmado?:any){
    debugger;
    let formData: FormData= new FormData();
    formData.append('codigoDocumento', documento);
    formData.append('origen', origen);
    formData.append('nameArchivoFirmado', nameDocuentoFirmado);
    formData.append('isFirmado', isFirmado);
    formData.append('archivoFirmado', archivoFirmado[0]);
    return this.http.post(`${environment.HOST}decretos/distrubirDocumento`,  formData);
  }

  distrubirRespuestaDocumento(documento: any, origen: any,
    nameDocuentoFirmado : any, isFirmado:any,
    documentoPadre:any, isAntiguo:any, archivoFirmado?:any){
    debugger;
    let formData: FormData= new FormData();
    formData.append('codigoDocumento', documento);
    formData.append('origen', origen);
    formData.append('documentoPadre', documentoPadre);
    formData.append('nameArchivoFirmado', nameDocuentoFirmado);
    formData.append('isFirmado', isFirmado);
    formData.append('isAntiguo', isAntiguo);
    formData.append('archivoFirmado', archivoFirmado[0]);
    return this.http.post(`${environment.HOST}decretos/distrubirRespuestaDocumento`,  formData);
  }



}
