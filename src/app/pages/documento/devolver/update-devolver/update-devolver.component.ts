import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update-devolver',
  templateUrl: './update-devolver.component.html',
  styleUrls: ['./update-devolver.component.css']
})
export class UpdateDevolverComponent implements OnInit {

  errorPDF : boolean = true;
  selectedFiles: any = null;
  url_pdf = '';

  constructor() { }

  ngOnInit(): void {
  }

  selectArchivoPrincipal(event: any): void {
    const fileTemp = event.target.files[0];
      const fileType = fileTemp.type;
      if (fileType !== 'application/pdf') {
        event.target.value = ''; // Borra la selección del archivo
        this.selectedFiles=null;
        Swal.fire('Lo sentimos', `Se presento un inconveniente en la consulta`, 'warning');
      }else{
        if(event.target.files.length>0){
          debugger;
          this.selectedFiles = event.target.files;
          this.url_pdf = this.selectedFiles[0].name;
          this.selectedFiles = event.target.files;

          this.fileInIframe(this.selectedFiles[0],"viewDocumento");

          let byteArray = new Uint8Array(
            atob(this.selectedFiles[0])
              .split('')
              .map((char) => char.charCodeAt(0))
          );
          let file = new Blob([byteArray], { type: 'application/pdf' });
            var rf_file = new File([file], URL.createObjectURL(file), {
              type: 'application/pdf',
            });
          let list = new DataTransfer();
          list.items.add(rf_file);
          this.selectedFiles = list.files;
        }
      }
  }

  fileInIframe(file:any,idFrame:any){
    let fileURL = URL.createObjectURL(file);
    this.url_pdf = fileURL;
    let iframe: any = document.getElementById(idFrame) as HTMLIFrameElement;
    debugger;
    iframe.contentWindow.location.replace(fileURL);
  }



}
