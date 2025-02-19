import { Injectable } from '@angular/core';
import { Periodo } from '../_model/periodo';
import { GenericService } from './generic.service';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Perfil } from '../_model/perfil';

@Injectable({
  providedIn: 'root'
})
export class PeriodoService extends GenericService<Periodo> {

  private periodoCambio = new Subject<Periodo[]>();
  
    constructor(protected override http: HttpClient) {
      super(http, `${environment.HOST}periodos`)
    }
  
    setPeriodoCambio(data:Periodo[]){
      this.periodoCambio.next(data);
    }
  
    getPeriodoCambio(){
      return this.periodoCambio.asObservable();
    }
}
