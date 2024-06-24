import { Injectable } from '@angular/core';
import { Archivo } from '../_model/archivo';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GenericService } from './generic.service';

@Injectable({
  providedIn: 'root'
})
export class ArchivoService extends GenericService<Archivo> {

  private archivoCambio = new Subject<Archivo[]>();

  constructor(protected override http: HttpClient) {
    super(http, `${environment.HOST}archivo`)
  }

  viewPDF(vidDecreto:any){
    return this.http.get(`${environment.HOST}archivo/viewPDF/${vidDecreto}`);
  }
}
