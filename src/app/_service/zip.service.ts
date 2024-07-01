import { Injectable } from '@angular/core';
// import * as JSZip from 'jszip';
@Injectable({
  providedIn: 'root'
})
export class ZipService {

  constructor() { }

  // compressFiles(files: File[]): Promise<Blob> {
  //   const zip = new JSZip();

  //   const promises = files.map(file => {
  //     return new Promise((resolve:any, reject) => {
  //       const reader = new FileReader();
  //       reader.onload = (event: any) => {
  //         zip.file(file.name, event.target.result);
  //         resolve();
  //       };
  //       reader.onerror = (error) => {
  //         reject(error);
  //       };
  //       reader.readAsArrayBuffer(file);
  //     });
  //   });

  //   return Promise.all(promises).then(() => {
  //     return zip.generateAsync({ type: 'blob' });
  //   });
  // }
}
