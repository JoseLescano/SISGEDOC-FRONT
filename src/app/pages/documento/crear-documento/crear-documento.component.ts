import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import { DocumentoArchivoAnexo } from 'src/app/_DTO/DocumentoArchivoAnexo';
import { Clase } from 'src/app/_model/clase';
import { Organizacion } from 'src/app/_model/organizacion';
import { ClaseService } from 'src/app/_service/clase.service';
import { CorrelativoService } from 'src/app/_service/correlativo.service';
import { DocumentoService } from 'src/app/_service/documento.service';
import { OrganizacionService } from 'src/app/_service/organizacion.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { ModalFirmaPeruComponent } from '../modal-firma-peru/modal-firma-peru.component';
import { of, switchMap } from 'rxjs';

@Component({
  selector: 'app-crear-documento',
  templateUrl: './crear-documento.component.html',
  styleUrls: ['./crear-documento.component.css']
})
export class CrearDocumentoComponent implements OnInit {

  form:FormGroup;
  cargando: boolean = false;
  firmantes:Organizacion[];
  organizacionesDestino:Organizacion[];
  copiasInformativas:Organizacion[];
  tipoDocumentos:Clase[];
  indicativo:string="";
  clases:Clase[];
  selectedFiles: any = null;
  uploadedFiles: any = [];
  totalFileSize: number = 0;
  url_pdf = '';
  mostrarFirma : boolean = false;
  documentoar : DocumentoArchivoAnexo = new DocumentoArchivoAnexo();

  documentoWordTempl : any;

  // =======================================================================================================

  constructor(
    private organizacionService: OrganizacionService,
    private claseService: ClaseService,
    private documentoService: DocumentoService,
    private correlativoService: CorrelativoService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {

    this.initForm();

  }

  // =======================================================================================================

  initForm(){
    this.cargando = true;
    this.form = new FormGroup({
      'firmante': new FormControl('', [Validators.required]),
      'tipoDocumento': new FormControl('', [Validators.required]),
      'nroCorrelativo': new FormControl(null, [Validators.required, Validators.min(1)]),
      'indicativo': new FormControl('', [Validators.required]),
      'destinatarios': new FormControl(new Array<String>,[Validators.required]),
      'copiaInformativa': new FormControl(new Array<String>),
      'asunto': new FormControl('', [Validators.required, Validators.minLength(10)])
    });

    this.form.controls['nroCorrelativo'].disable();

    this.organizacionService.findFirmantes(sessionStorage.getItem(environment.codigoOrganizacion)).subscribe((response:any)=>  {
      this.firmantes = response.data
    });

    this.claseService.findForCrearDocumento().subscribe((response:any)=> this.clases = response.data );
    this.cargando = false;
  }

  findDestinatarios(){

    let firmante = this.form.get('firmante').value;
    let tipoDocumento = this.form.get('tipoDocumento').value;

    if (firmante!='' && tipoDocumento !=''){
      this.cargando = true;
      this.form.controls['destinatarios'].setValue('');
      this.form.controls['copiaInformativa'].setValue('');
      this.organizacionesDestino = [];
      this.copiasInformativas = [];

      this.organizacionService.destinatariosExternoByCodigo(firmante.codigoInterno, tipoDocumento).subscribe((response:any)=> {
        this.organizacionesDestino = response.data;
        this.copiasInformativas = response.data;
      });
      this.cargando = false;
    }
    if (firmante.codigoInterno === sessionStorage.getItem(environment.codigoOrganizacion))
      this.mostrarFirma = true;
    else this.mostrarFirma = false;
  }


  getIndicativo(){
    let organizacion  = this.form.get('firmante').value;
    // const selectedOption = this.firmantes.find(option => option.codigoInterno.includes(event.option.value ));
    this.form.get('indicativo').setValue(organizacion.indicativo);
  }


  operate(){

    if(this.form.valid && this.selectedFiles != null){
      this.cargando = true;
      this.documentoar.organizacionOrigen = this.form.value['firmante'].codigoInterno;

      this.documentoar.clase = this.form.value['tipoDocumento'];
      this.documentoar.nroOrden =  this.form.get('nroCorrelativo').value;
      this.documentoar.indicativo =  this.form.value['indicativo'];
      this.documentoar.destinos = this.form.value['destinatarios'];
      this.documentoar.copiasInformativas = this.form.value['copiaInformativa'];
      this.documentoar.asunto= this.form.value['asunto'];
      this.documentoar.archivoPrincipal = this.selectedFiles.item(0);
      if (this.documentoar.organizacionOrigen== sessionStorage.getItem(environment.codigoOrganizacion)){
        if (!this.firmado){
          Swal.fire({
            title: "¿ESTÁS SEGURO?",
            text: "EL DOCUMENTO SERÁ DISTRIBUIDO SIN FIRMA DIGITAL, ¿DESEAS CONTINUAR?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "SÍ, DESEO CONTINUAR"
          }).then((result) => {
            if (result.isConfirmed) {
              this.documentoService.crearDocumento(this.documentoar, this.nameDocuentoFirmado,
                this.firmado,  this.uploadedFiles ).subscribe(
                {
                  next: (response:any)=> {
                    if (response.httpStatus=='CREATED'){
                      this.cargando = false;
                      this.initForm();
                      Swal.fire(`Se ha registrado envio de documento`, response.message, 'info');
                    }
                  },
                  error: (err: any) => {
                    this.cargando = false;
                    Swal.fire('Lo sentimos', `No se ha registrado documento`, 'info');
                  }
                }
              );
            }
          });
        }else {
          this.documentoService.crearDocumento(this.documentoar, this.nameDocuentoFirmado,
            this.firmado,  this.uploadedFiles ).subscribe(
            {
              next: (response:any)=> {
                if (response.httpStatus=='CREATED'){
                  this.cargando = false;
                  this.initForm();
                  Swal.fire(`Se ha registrado envio de documento`, response.message, 'info');
                }
              },
              error: (err: any) => {
                this.cargando = false;
                Swal.fire('Lo sentimos', `No se ha registrado documento`, 'info');
              }
            }
          );
        }
      }else {
        this.documentoService.crearDocumentoParaFirmar(
          this.documentoar,
          sessionStorage.getItem(environment.codigoOrganizacion), this.documentoWordTempl).subscribe((response:any)=>{
          if (response.httpStatus=='CREATED'){
            this.cargando = false;
            this.initForm();
            Swal.fire(`Se ha registrado envio de documento`, response.message, 'info');
          }
        }, error => {
          this.cargando = false;
          Swal.fire('Lo sentimos', `No se ha registrado documento`, 'info');
        });
      }
     } else {
      this.cargando = false;
      // if (this.firmado == false)
      //   Swal.fire('Lo sentimos', `Debe de firmar el documento digitalmente para poder continuar!`, 'info');
      // else
      Swal.fire('Lo sentimos', `Se presento un inconveniente!`, 'warning');
    }
  }


  validarPlantilla():boolean{
    var firmante = this.form.get('firmante').value != null && this.form.get('firmante').value != '' ;
    var tipoDocumento = this.form.get('tipoDocumento').value != null && this.form.get('tipoDocumento').value != '' ;
    var indicativo = this.form.get('indicativo').value != null && this.form.get('indicativo').value != '' ;
    var destinatarios = this.form.get('destinatarios').value != null && this.form.get('destinatarios').value != '' ;
    var asunto = (this.form.get('asunto').value != null && this.form.get('asunto').value != '') && !this.form.get('asunto').hasError('minlength') ;
    if (!firmante || !tipoDocumento || !indicativo || !destinatarios || !asunto ) {
      Swal.fire('Datos incompletos', `Complete todos los campos para generar plantilla de Word`, 'error');
      return false;
    } else {
      return true;
    }

  }

  generarPlantilla() {
    if (this.validarPlantilla()) {
      this.getUltimoNumero().pipe(
        switchMap(() => {
          var tipoDocumento = this.form.get('tipoDocumento').value;
          var asunto = this.form.get('asunto').value;
          var destino = this.form.get('destinatarios').value;
          var firmante = this.form.get('firmante').value;
          var indicativo = this.form.get('indicativo').value;
          var copiasInformativas = this.form.get('copiaInformativa').value;
          var correlativo = this.form.get('nroCorrelativo').value;

          return this.documentoService.generarPlantillaWord(
              tipoDocumento, asunto, destino, firmante.codigoInterno,
              indicativo, correlativo, copiasInformativas
          );
        })
      ).subscribe((response: any) => {
        if (response.httpStatus === 'CREATED') {
            this.downloadWord(response.data[0]);
        }
      }, error => {
        Swal.fire('Lo sentimos', 'Se presentó un inconveniente en la generación del Word', 'info');
      });
    }
}

  get nativeDocument(): any {
    return document;
  }

  getUltimoNumero() {
    var tipoDocumento = this.form.get('tipoDocumento').value;
    var firmante = this.form.get('firmante').value;

    if (tipoDocumento != null && firmante != null) {
        return this.correlativoService.findClaseAndOrganizacion(tipoDocumento, firmante.codigoInterno).pipe(
            switchMap((response: any) => {
                var correlativo = response;
                this.form.controls['nroCorrelativo'].setValue(correlativo.numero);
                return of(true);  // Se devuelve un observable para indicar que el proceso ha terminado
            })
        );
    } else {
        return of(false);  // En caso de que tipoDocumento o firmante sean nulos, se devuelve un observable de false
    }
  }

  generarNombreArchivo() :any{
    const timestamp = new Date().getTime(); // Marca de tiempo actual
    const randomValue = Math.floor(Math.random() * 1000); // Valor aleatorio entre 0 y 999
    const nombreArchivo = `archivo_${timestamp}_${randomValue}`; // Formato del nombre del archivo
    return nombreArchivo;
  }

  downloadWord(word: any) {
    var tipoDocumento = this.form.get('tipoDocumento').value;
    var correlativo = this.form.get('nroCorrelativo').value;
    const resultado = this.clases.find((tipo: any) => tipo.codigo === tipoDocumento);

    const linkSource = `data:application/msword;base64,${word}`;
     const downloadLink = document.createElement('a');
     const fileName = resultado.nombre + " " +  correlativo +'.docx';
     downloadLink.href = linkSource;
     downloadLink.download = fileName;
     downloadLink.click();
  }

  agregarArchivo() {
    this.nativeDocument.getElementById('documentoPrincipal').click();
  }

  selectArchivoPrincipal(event: any): void {
    this.selectedFiles = null;
    const fileTemp = event.target.files[0];
    const fileType = fileTemp.type;
    if (fileType !== 'application/pdf' && fileType !== 'application/msword'
        && fileType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        event.target.value = ''; // Borra la selección del archivo
        this.selectedFiles=null;
        Swal.fire('Lo sentimos', `Debe de seleccionar un documento PDF ó WORD`, 'info');
    } else{
        if(event.target.files.length>0){
          this.selectedFiles = event.target.files;
          this.url_pdf = this.selectedFiles[0].name;
          if (this.selectedFiles[0].type == 'application/pdf') {
            this.convertirArchivoABase64(this.selectedFiles.item(0));
          }else {
            this.documentoWordTempl = this.selectedFiles.item(0); // Guardo el documento word temp
            this.documentoService
            .convertFileToPDF(this.selectedFiles.item(0))
            .subscribe( {
              next: (resp: any) => {
                this.cargando = true;
                this.nameDocuentoFirmado = resp[1];
                let byteArray = new Uint8Array(atob(resp[0]).split('').map((char) => char.charCodeAt(0)));
                let file = new Blob([byteArray], { type: 'application/pdf' });
                var rf_file = new File([file], URL.createObjectURL(file), {
                  type: 'application/pdf',
                });
                let list = new DataTransfer();
                list.items.add(rf_file);
                this.selectedFiles = list.files;
                this.url_pdf = this.selectedFiles[0].name;
                this.cargando = false;
                this.convertirArchivoABase64(this.selectedFiles.item(0));
              } , error: (err: any) => {
                this.cargando = false;
                Swal.fire('Lo sentimos', 'Se presento un inconveniente al convertir Word a PDF', 'info');
              }
            });
          }
        }
      }
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

  convertirArchivoABase64(file: File) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const base64 = reader.result as string;
        // Ahora abre el modal con el archivo codificado en base64
        this.abrirFirmaPeru(base64);
    };
    reader.onerror = error => {
        console.log('Error: ', error);
  };
}

  abrirFirmaPeru(documento:any): void {
    const dialogRef = this.dialog.open(ModalFirmaPeruComponent,{
      width: '90%',
      height: '80%',

      data: { documento }
    });

  }

  limpiar(){
    this.form.reset();
    this.selectedFiles=null;
  }

  _window(): any {
    // return the global native browser window object
    return window;
  }

  firmarDocumento(){
    var _this:any=this;
    this.cargando = true;
    this.documentoService.firmarDocumento(this.selectedFiles[0]).subscribe((response:any)=>{
      var nameFile=response[1];
       this._window().iniciarFirma((response[1]),
        function(){ _this.updateIframeWithKeyDigitalGeneral(nameFile); }
      );
    });
    this.cargando = false;
  }

  nameDocuentoFirmado : string = "";
  firmado : boolean = false;
  updateIframeWithKeyDigitalGeneral(inNameFile: any,tipo:any) {
    this.nameDocuentoFirmado = inNameFile;
    var _this: any = this;
    _this.firmado = true;
    this.documentoService
      .getFileDocumentKeyDigital(inNameFile)
      .subscribe((resp:any) => {
        let byteArray = new Uint8Array(
          atob(resp)
            .split('')
            .map((char) => char.charCodeAt(0))
        );
        let file = new Blob([byteArray], { type: 'application/pdf' });
        var rf_file = new File([file], URL.createObjectURL(file), {
          type: 'application/pdf',
        });
        let listFile = [rf_file];
        let list = new DataTransfer();
        list.items.add(rf_file);

        this.selectedFiles = list.files;
      });

  }


}
