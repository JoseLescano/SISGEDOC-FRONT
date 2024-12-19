import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FacilitaService {

  constructor(private http: HttpClient) { }

  getDocumentoPendientes(){
    return this.http.get(`${environment.HOST}facilita/findPendientes`);
  }

  getArchivos(id: any){
    return this.http.get(`${environment.HOST}facilita/findArchivosByDocumento/${id}`);
  }

  downloadPdf(urlDocumento): Observable<Blob> {
    let token = sessionStorage.getItem(environment.TOKEN_NAME);
    return this.http.get(urlDocumento, {
      responseType: 'blob',
      headers: new HttpHeaders()
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/json')
    });
  }


}
