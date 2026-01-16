import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { Correspondencia } from '../_model/correspondencia';
import { catchError, Observable, Subject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CorrespondenciaOP } from '../_DTO/CorrespondenciaOP';

@Injectable({
  providedIn: 'root'
})
export class CorrespondenciaService extends GenericService<Correspondencia> {

  private correspondenciaCambio = new Subject<Correspondencia[]>();

  constructor(protected override http: HttpClient) {
    super(http, `${environment.HOST}correspondencias`)
  }

  findByOrganizacionDestino(orgDestino: any){
    return this.http.get<Correspondencia[]>(`${environment.HOST}correspondencias/findByOrganizacionDestino/${orgDestino}`);
  }

  listEntregarByOP(orgDestino: any, orgOrigen: any, p?: number, s?: number, sortField?: string, sortDir?: string){
    return this.http.get<Correspondencia[]>(`${environment.HOST}correspondencias/listEntregarByOP/${orgDestino}/${orgOrigen}?page=${p}&size=${s}&sort=${sortField},${sortDir}`);
  }

  correspondenciaOP(correspondencia: CorrespondenciaOP){
    let formData:FormData = new FormData();
    formData.append('origen', correspondencia.origen);
    formData.append('destino', correspondencia.destino);
    formData.append('fechaDocumento', environment.convertDateToStr(correspondencia.fechaRegistro));
    formData.append('clase', correspondencia.clase);
    formData.append('nroSobre', correspondencia.nroSobre);
    formData.append('folio', correspondencia.folio);
    formData.append('asunto', correspondencia.asunto);
    formData.append('observaciones', correspondencia.observaciones);
    formData.append('orgRegistra', correspondencia.organizacionRegistra);

    return this.http.post(`${environment.HOST}correspondencias/correspondenciaOP`, formData);
  }

  updateCorrespondencia(correspondenciaId:any, correspondencia: CorrespondenciaOP){
    // let formData:FormData = new FormData();
    // formData.append('origen', correspondencia.origen);
    // formData.append('destino', correspondencia.destino);
    // formData.append('fechaDocumento', environment.convertDateToStr(correspondencia.fechaRegistro));
    // formData.append('clase', correspondencia.clase);
    // formData.append('nroSobre', correspondencia.nroSobre);
    // formData.append('folio', correspondencia.folio);
    // formData.append('asunto', correspondencia.asunto);
    // formData.append('observaciones', correspondencia.observaciones);
    // formData.append('orgRegistra', correspondencia.organizacionRegistra);
    debugger

    return this.http.post(`${environment.HOST}correspondencias/updateCorrespondencia/${correspondenciaId}`, correspondencia );
  }

  entregaCorrespondencia(origen: any, usuarioRecibe: any,
    contrasena: any, correspondencias: Correspondencia[], dniExterno?: any) {

    let formData: FormData = new FormData();
    formData.append('origen', origen);
    formData.append('usuarioRecibe', usuarioRecibe);
    formData.append('contrasena', contrasena);
    formData.append('dniExterno', dniExterno);
    correspondencias.forEach(item => {
      formData.append('correspondencias', item.codigo.toString());
    });

    return this.http.post(`${environment.HOST}correspondencias/entregaCorrespondencia`,
      formData, {
        responseType: 'blob',
        observe: 'response' // Importante: observar la respuesta completa
      }).pipe(
        catchError(async (error) => {
          // Si el error tiene un blob, intentar parsearlo como JSON
          if (error.error instanceof Blob) {
            const text = await error.error.text();
            try {
              const errorObj = JSON.parse(text);
              // Lanzar el error con el mensaje parseado
              throw new Error(errorObj.mensaje || errorObj.message || 'Error desconocido');
            } catch (e) {
              throw new Error(text || 'Error al procesar la solicitud');
            }
          }
          throw error;
        })
      );
  }

  searchByFechas(
    fechaInicio: any,
    fechaFin: any,
    orgOrigen: string,
    page: number = 0,
    size: number = 20,
    sortField: string = 'codigo',
    sortDirection: string = 'desc',
    search: string = ''
  ): Observable<any> {

    let params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin)
      .set('orgOrigen', orgOrigen)
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortField', sortField)
      .set('sortDirection', sortDirection);

    // Agregar parámetro de búsqueda si existe
    if (search && search.trim() !== '') {
      params = params.set('search', search.trim());
    }

    return this.http.post<any>(`${environment.HOST}correspondencias/searchByFechas`, null, { params });
  }

  reportCorrespondencia(codigo: any){

    let formData:FormData = new FormData();
    formData.append('codigo', codigo);

    return this.http.post(`${environment.HOST}correspondencias/reportSeguimientoCorrespondencia`, formData);
  }

}
