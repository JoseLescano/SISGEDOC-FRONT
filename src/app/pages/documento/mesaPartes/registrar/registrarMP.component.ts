import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Clase } from 'src/app/_model/clase';
import { Documento } from 'src/app/_model/documento.model';
import { Organizacion } from 'src/app/_model/organizacion';
import { ClaseService } from 'src/app/_service/clase.service';
import { DocumentoService } from 'src/app/_service/documento.service';
import { OrganizacionService } from 'src/app/_service/organizacion.service';
import { PrioridadService } from 'src/app/_service/prioridad.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registrarMP',
  templateUrl: './registrarMP.component.html',
  styleUrls: ['./registrarMP.component.css']
})
export class RegistrarMPComponent implements OnInit {

  public listaTipoOrganizacion : any = [
    {
      nombre: "INTERNA",
      codigo: "I"
    },
    {
      nombre: "EXTERNA",
      codigo: "E"
    }
  ];

  remitentes:Organizacion[];
  clases:Clase[];
  prioridades : any;

  public selectedFiles: any = null;
  public url_pdf = '';

  form:FormGroup;
  archivoPDF: any;
  documento:Documento = new Documento();

  constructor(private organizacionService: OrganizacionService,
            private claseService: ClaseService,
            private prioridadService: PrioridadService,
            private documentoService:DocumentoService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.organizacionService.getRemitentesInterno().subscribe((response:any)=>{
      this.remitentes = response.data;
    });
    this.claseService.listar().subscribe((response:any)=> this.clases = response.data );
    this.prioridadService.listar().subscribe(data=> this.prioridades = data);
  }

  initForm(){
    this.form = new FormGroup({
      'tipoOrganizacion': new FormControl('', [Validators.required]),
      'organizacionRemitente': new FormControl('', [Validators.required]),
      'tipoDocumento': new FormControl('', [Validators.required]),
      'nroDocumento': new FormControl('', [Validators.required]),
      'indicativo': new FormControl('', [Validators.required]),
      'remitente': new FormControl('', [Validators.required]),
      'prioridad': new FormControl('', [Validators.required]),
      'fechaDocumento': new FormControl('', [Validators.required]),
      'folio': new FormControl('', [Validators.required]),
      'asunto': new FormControl('', [Validators.required]),
      'archivoPDF': new FormControl('', [Validators.required]),
      'archivosAnexos': new FormControl([]),
      'destinos': new FormControl([])
    });
    this.form.controls['folio'].disable();
  }

  operate(){
    if (this.form.valid){
      this.documento.tipoOrganizacion = this.form.value['tipoOrganizacion'];
      this.documento.organizacionOrigen = this.form.value['organizacionRemitente'];
      this.documento.asunto= this.form.value['asunto'];
      this.documento.claveIndicativo= this.form.value[''];
      this.documento.clase = this.form.value['tipoDocumento'];
      this.documento.claveIndicativo= this.form.value['remitente'];
      this.documento.fechaDocumento== this.form.value['fechaDocumento'];
      console.log(this.form.value['organizacionRemitente']);
    } else {
      Swal.fire('Lo sentimos', `Se presento un inconveniente!`, 'warning');
    }
    
    // this.documentoService.recibirDocumentoMP(this.documento).subscribe(data => console.log('xd'));
  }

  get nativeDocument(): any {
    return document;
  }

  agregarArchivo() {
    this.nativeDocument.getElementById('btnFileUpload213').click();
  }

  fileInIframe(file:any,idFrame:any){
    let fileURL = URL.createObjectURL(file);
    this.url_pdf = fileURL;
    let iframe: any = document.getElementById(''+idFrame) as HTMLIFrameElement;
    iframe.contentWindow.location.replace(fileURL);
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
          this.selectedFiles = event.target.files;
          this.url_pdf = this.selectedFiles[0].name;
          this.selectedFiles = event.target.files;  
          environment.cantidadPaginasPDF(this.selectedFiles[0],
            (cpages:any)=>{
              this.form.controls['folio'].setValue(cpages);
              this.form.controls['archivoPDF'].setValue(this.selectedFiles[0]);
            }
          );
          
          this.fileInIframe(this.selectedFiles[0],"documentoPrincipal");
          
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
