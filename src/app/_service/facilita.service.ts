import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FacilitaService {

  constructor(private http: HttpClient) { }

  getDocumentoPendientes(){
    return this.http.get(`${environment.HOST}facilita/listar_documentos_pendiente`);
  }
}
