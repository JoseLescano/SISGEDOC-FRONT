import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { DocumentoService } from 'src/app/_service/documento.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registrar',
  templateUrl: './registrar.component.html',
  styleUrls: ['./registrar.component.css']
})
export class RegistrarComponent implements OnInit {

  url_pdf: any;
  vidDocumento:any;
  observaciones : any = '';
  selectedFiles: any;
  errorPDF : boolean = false;

  constructor( private documentoService:DocumentoService,
                  private route: ActivatedRoute,
                  private elRef: ElementRef,
                  private router: Router) { }

  ngOnInit(): void {
    this.getIdDocumento();
  }

  getIdDocumento(): void {
    const id = +this.route.snapshot.paramMap.get('codigoDocumento');
    this.vidDocumento = id;
    this.viewDocumento(id);
  }

  viewDocumento(vidDocumento: any){
    this.documentoService.viewPDF(vidDocumento).subscribe((response: any)=>{
      this.crearDocumento(response.data);
      this.errorPDF = false;
    }, error => {
      this.errorPDF = true;
      Swal.fire('LO SENTIMOS', `SE PRESENTO UN INCONVENIENTE EN CARGAR PDF!`, 'warning');
    });
  }

  crearDocumento(resp: any){
    let byteArray = new Uint8Array(
      atob(resp[0])
        .split('')
        .map((char) => char.charCodeAt(0))
    );    
    let file = new Blob([byteArray], { type: 'application/pdf' });
    let fileURL = URL.createObjectURL(file);
    this.url_pdf = fileURL;
    let iframe:any = this.elRef.nativeElement.querySelector('iframe')as HTMLIFrameElement;
    iframe.contentWindow.location.replace(fileURL);
    
  }

  archivarDocumento(){
    debugger;
    if (this.observaciones != '' && this.observaciones != null){
      this.documentoService.archivarDocumento(this.vidDocumento, environment.codigoOrganizacion, 
        'wrojasf', this.observaciones, this.selectedFiles == null? '':  this.selectedFiles.item(0)).subscribe((response: any)=> {
          debugger;
         if (response.httpStatus=='OK'){
           Swal.fire(response.message, `Se archivo documento correctamente`, 'info');
           this.router.navigate(['/pendientes']);
         }else {
           Swal.fire(response.message, `Se presento un inconveniente para archivar documento`, 'info');
         }
       }, (error:any)=> {
         Swal.fire('Lo sentimos!', `No podemos archivar documento`, 'info');
       });
    }else {
      Swal.fire('Lo sentimos!', `Debe de ingresar una observación para continuar con el registro`, 'info');
    }
     
  }

  selectArchivoPrincipal(event: any): void {
    const fileTemp = event.target.files[0];
      const fileType = fileTemp.type;
      if (fileType !== 'application/pdf') {
        event.target.value = ''; // Borra la selección del archivo
        this.selectedFiles=null;
        alert("Seleccione solo archivo PDF");
      }else{
        if(event.target.files.length>0){
          this.selectedFiles = event.target.files;
          this.url_pdf = this.selectedFiles[0].name;
          this.selectedFiles = event.target.files;
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


}
