import { Injectable } from '@angular/core';
import { Anexo } from '../_model/anexo';
import { GenericService } from './generic.service';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnexoService extends GenericService<Anexo> {

  private anexoCambio = new Subject<Anexo[]>();

  constructor(protected override http: HttpClient) {
    super(http, `${environment.HOST}anexos`)
  }

  findByDocumento(vidDocumento:any){
    return this.http.get<Anexo[]>(`${environment.HOST}anexos/findByDocumento/${vidDocumento}`);
  }

  descargarAnexo(anexo:any){
    return this.http.post(`${environment.HOST}anexos/downloadAnexo`, anexo);
  }

}
