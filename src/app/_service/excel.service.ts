import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor(
    private http: HttpClient
  ) { }

  public exportTableToExcel(tableId: string, fileName: string): void {
    const tableElement = document.getElementById(tableId);
    const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(tableElement);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, fileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, `${fileName}.xlsx`);
  }

  downloadPendientes(codigoInterno: string): Observable<Blob> {
    let formData : FormData = new FormData();
    formData.append('codigoInterno', codigoInterno);
    const url = `${environment.HOST}documentos/exportPendientesExcel`;
    return this.http.post(url, formData, { responseType: 'blob' }).pipe(
      map((res: Blob) => {
        return res;
      })
    );
  }

  downloadDecretadosByFechas(codigoInterno: string, fi: any, ff:any): Observable<Blob> {
    let formData : FormData = new FormData();
    formData.append('codigoInterno', codigoInterno);
    formData.append('fi', fi);
    formData.append('ff', ff);
    const url = `${environment.HOST}documentos/exportDecretadosExcel`;
    return this.http.post(url, formData, { responseType: 'blob' }).pipe(
      map((res: Blob) => {
        return res;
      })
    );
  }

  downloadDecretadosForDay(codigoInterno: string, fi: any): Observable<Blob> {
    let formData : FormData = new FormData();
    formData.append('codigoInterno', codigoInterno);
    formData.append('fecha', fi);
    const url = `${environment.HOST}documentos/exportDecretadosForDayExcel`;
    return this.http.post(url, formData, { responseType: 'blob' }).pipe(
      map((res: Blob) => {
        return res;
      })
    );
  }


  exportEnviadosExcel(codigoInterno: string, fi: any, ff?:any): Observable<Blob> {
    let formData : FormData = new FormData();
    formData.append('codigoInterno', codigoInterno);
    formData.append('fi', fi);
    formData.append('ff', ff);
    const url = `${environment.HOST}documentos/exportEnviadosExcel`;
    return this.http.post(url, formData, { responseType: 'blob' }).pipe(
      map((res: Blob) => {
        return res;
      })
    );
  }

  exportRegistradosExcel(codigoInterno: string, fi: any, ff?:any): Observable<Blob> {
    let formData : FormData = new FormData();
    formData.append('codigoInterno', codigoInterno);
    formData.append('fi', fi);
    formData.append('ff', ff);
    const url = `${environment.HOST}documentos/exportRegistradosExcel`;
    return this.http.post(url, formData, { responseType: 'blob' }).pipe(
      map((res: Blob) => {
        return res;
      })
    );
  }

  exportSuperAdm(codigoInterno: string): Observable<Blob> {
    let formData : FormData = new FormData();
    formData.append('codigoOrganizacion', codigoInterno);
    const url = `${environment.HOST}documentos/exportSuperAdm`;
    return this.http.post(url, formData, { responseType: 'blob' }).pipe(
      map((res: Blob) => {
        return res;
      })
    );
  }

  exportCorrespondencia(fi: any, ff: any, organizacionRegistra: string): Observable<Blob> {
    let formData : FormData = new FormData();
    formData.append('fechaInicio', fi);
    formData.append('fechaFin', ff);
    formData.append('organizacionRegistra', organizacionRegistra);
    const url = `${environment.HOST}correspondencias/exportExcel`;
    return this.http.post(url, formData, { responseType: 'blob' }).pipe(
      map((res: Blob) => {
        return res;
      })
    );
  }



}
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
