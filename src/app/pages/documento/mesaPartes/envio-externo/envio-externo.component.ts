import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DocumentoArchivoAnexo } from 'src/app/_DTO/DocumentoArchivoAnexo';
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
  selector: 'app-envio-externo',
  templateUrl: './envio-externo.component.html',
  styleUrls: ['./envio-externo.component.css']
})
export class EnvioExternoComponent implements OnInit {

  firstFormGroup : FormGroup;
  cargando: boolean;
  uploadedFiles: any = [];
  totalFileSize: number = 0;

  remitentes:Organizacion[] = [];
  clases:Clase[];
  prioridades : any;
  selectedFiles: any = null;
  url_pdf = '';
  archivoPDF: any;
  documento:Documento = new Documento();
  organizacionesDestino:Organizacion[];
  copiasInformativas:Organizacion[];
  documentoar : DocumentoArchivoAnexo = new DocumentoArchivoAnexo();


  constructor(
    private organizacionService: OrganizacionService,
    private claseService: ClaseService,
    private prioridadService: PrioridadService,
    private documentoService:DocumentoService,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.cargando = true;
    this.initForm();
    this.organizacionService.getRemitentesInterno().subscribe((response:any)=>{
      this.remitentes = response.data;
      this.copiasInformativas = response.data;
    });
    this.claseService.listar().subscribe((response:any)=> this.clases = response.data );
    this.prioridadService.listar().subscribe(data=> this.prioridades = data);
    this.cargando = false;
  }

  initForm(){
    this.firstFormGroup = this.formBuilder.group({
      'destinos': new FormControl([], [Validators.required]),
      'copiasInformativas': new FormControl([]),
      'tipoDocumento':  new FormControl('', [Validators.required]),
      'nroDocumento':  new FormControl('', [Validators.required]),
      'indicativo':  new FormControl('', [Validators.required]),
      'remitente':  new FormControl('', [Validators.required]),
      'fechaDocumento':  new FormControl('', [Validators.required]),
      'prioridad':  new FormControl('', [Validators.required]),
      'folio':  new FormControl('', [Validators.required]),
      'asunto':  new FormControl('', [Validators.required]),

    });
  }

  operate(){

    if (this.firstFormGroup.valid){
      this.cargando = true;

      this.documentoar.destinos = this.firstFormGroup.value['destinos'];
      this.documentoar.copiasInformativas = this.firstFormGroup.value['copiasInformativas'];
      this.documentoar.clase = this.firstFormGroup.value['tipoDocumento'];
      this.documentoar.nroOrden =  this.firstFormGroup.value['nroDocumento'];
      this.documentoar.indicativo =  this.firstFormGroup.value['indicativo'];
      this.documentoar.claveIndicativo= this.firstFormGroup.value['remitente'];
      this.documentoar.fechaDocumento= this.firstFormGroup.value['fechaDocumento'];
      this.documentoar.prioridad = this.firstFormGroup.value['prioridad'];
      this.documentoar.folio = this.firstFormGroup.value['folio'];
      this.documentoar.asunto= this.firstFormGroup.value['asunto'];
      this.documentoar.organizacionOrigen = sessionStorage.getItem(environment.codigoOrganizacion);
      this.documentoar.archivoPrincipal = this.selectedFiles.item(0);

      this.documentoService.envioExterno(this.documentoar).subscribe((response:any) =>{
      if (response.httpStatus=='CREATED'){
        this.cargando = false;
        this.initForm();
        Swal.fire(`Se ha registrado envio de documento`, response.message, 'info');
        this.router.navigate(['../principal/recibir-documento']);
      }
    }, error => {
      this.cargando = false;
      Swal.fire('Lo sentimos', `No se ha registrado documento`, 'info');
    });
   } else {
    this.cargando = false;
    Swal.fire('Lo sentimos', `Se presento un inconveniente!`, 'warning');
   }
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

  selectAnexos(event: any): void {
    let files = event.target.files;
    for (let i = 0; i < files.length; i++) {
      this.uploadedFiles.push(files[i]);
    }
    this.calculateTotalFileSize();
  }


  getFileType(file: File): string {
    const fileType = file.type;
    if (fileType === 'application/pdf') {
      return 'PDF';
    } else if (fileType === 'application/msword') {
      return 'DOC';
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return 'DOCX';
    }else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      return 'xlsx';
    }
     else {
      return 'Desconocido';
    }
  }

  removeFile(file: File): void {
    const index = this.uploadedFiles.indexOf(file);
    if (index > -1) {
      this.uploadedFiles.splice(index, 1);
    }
    this.calculateTotalFileSize();
  }

  getFileSize(size: number): string {
    if (size < 1024) {
      return size + ' B';
    } else if (size < 1048576) {
      return (size / 1024).toFixed(2) + ' KB';
    } else {
      return (size / 1048576).toFixed(2) + ' MB';
    }
  }

  calculateTotalFileSize(): void {
    this.totalFileSize = this.uploadedFiles.reduce((acc, file) => acc + file.size, 0);
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
              this.firstFormGroup.controls['folio'].setValue(cpages);
              //this.firstFormGroup.controls['archivoPDF'].setValue(this.selectedFiles.item(0));
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
