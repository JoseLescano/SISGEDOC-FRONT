import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { switchMap, of } from 'rxjs';
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
import { ActivatedRoute } from '@angular/router';
import { ViewDocumentoComponent } from '../view-documento/view-documento.component';
import { Documento } from 'src/app/_model/documento.model';

@Component({
  selector: 'app-respuesta',
  templateUrl: './respuesta.component.html',
  styleUrls: ['./respuesta.component.css']
})
export class RespuestaComponent implements OnInit {

  form:FormGroup;
  cargando: boolean = false;
  firmantes:Organizacion[];
  organizacionesDestino:Organizacion[];
  copiasInformativas:Organizacion[];
  tipoDocumentos:Clase[];
  indicativo:string="";
  clases:Clase[];
  selectedFiles: any = null;
  url_pdf = '';
  mostrarFirma : boolean = false;
  documentoar : DocumentoArchivoAnexo = new DocumentoArchivoAnexo();
  vidDocumento :any;
  uploadedFiles : any = [];

  constructor(
    private organizacionService: OrganizacionService,
    private claseService: ClaseService,
    private documentoService: DocumentoService,
    private correlativoService: CorrelativoService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    debugger;
    this.cargando = true;
    this.getIdDocumento();
    this.initForm();
    this.organizacionService.findFirmantes(sessionStorage.getItem(environment.codigoOrganizacion)).subscribe((response:any)=>  {
      this.firmantes = response.data
    });
    // this.firmanteFilter$ = this.firmanteControl.valueChanges.pipe(map(val => this.filterfirmantes(val)));
    this.claseService.findForCrearDocumento().subscribe((response:any)=> this.clases = response.data );
    this.cargando = false;
  }

  getIdDocumento(): void {
    const id = +this.route.snapshot.paramMap.get('codigoDocumento');
    this.vidDocumento = id;
  }


  openDialog(documentoSeleccionado?:any): void {
    let documento: Documento = new Documento;
    documento.codigo = documentoSeleccionado;
    const dialogRef = this.dialog.open(ViewDocumentoComponent, {
      width: '60%',
      height: '95%',
      data: documento,
    });
  }


  initForm(){
    this.form = new FormGroup({
      'documentoReferencia': new FormControl(this.vidDocumento, [Validators.required]),
      'firmante': new FormControl('', [Validators.required]),
      'tipoDocumento': new FormControl('', [Validators.required]),
      'nroCorrelativo': new FormControl(null, [Validators.required, Validators.min(1)]),
      'indicativo': new FormControl('', [Validators.required]),
      'destinatarios': new FormControl(new Array<String>,[Validators.required]),
      'copiaInformativa': new FormControl(new Array<String>),
      'asunto': new FormControl('', [Validators.required, Validators.minLength(10)])
    });
    this.form.controls['documentoReferencia'].disable();
    this.form.controls['nroCorrelativo'].disable();
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
        this.documentoService.crearDocumento(this.documentoar, this.vidDocumento, "", false).subscribe((response:any)=>{
          if (response.httpStatus=='CREATED'){
            this.cargando = false;
            this.initForm();
            Swal.fire(`Se ha registrado envio de documento`, response.message, 'info');
          }
        }, error => {
          this.cargando = false;
          Swal.fire('Lo sentimos', `No se ha registrado documento`, 'info');
        });
      }else {
        this.documentoService.crearRespuestaParaFirmar(
          this.documentoar,
          sessionStorage.getItem(environment.codigoOrganizacion),
          this.vidDocumento).subscribe((response:any)=>{
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
      this.cargando = true;
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
            console.log(response.data);
            this.downloadWord(response.data[0]);
            this.cargando = false;
        }
      }, error => {
        this.cargando = false;
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
            // environment.cantidadPaginasPDF(this.selectedFiles[0],
            //   (cpages:any)=>{
            //     //this.form.controls['archivoPDF'].setValue(this.selectedFiles.item(0));
            //   }
            // );
          }else {
            this.cargando = true;
            this.documentoService
            .convertFileToPDF(this.selectedFiles.item(0))
            .subscribe((resp: any) => {
              let byteArray = new Uint8Array(atob(resp[0]).split('').map((char) => char.charCodeAt(0)));
              let file = new Blob([byteArray], { type: 'application/pdf' });
              var rf_file = new File([file], URL.createObjectURL(file), {
                type: 'application/pdf',
              });
              let listFile = [rf_file];
              let list = new DataTransfer();
              list.items.add(rf_file);
              this.selectedFiles = list.files;
              this.url_pdf = this.selectedFiles[0].name;
              this.cargando = false;
              this.convertirArchivoABase64(this.selectedFiles.item(0));
            }, error => {
              this.cargando = false;
              Swal.fire('Lo sentimos', 'Se presento un inconveniente al convertir Word a PDF', 'info');
            });
          }


          // let byteArray = new Uint8Array(
          //   atob(this.selectedFiles[0])
          //     .split('')
          //     .map((char) => char.charCodeAt(0))
          // );
          // let file = new Blob([byteArray], { type: 'application/pdf' });
          //   var rf_file = new File([file], URL.createObjectURL(file), {
          //     type: 'application/pdf',
          //   });
          // let list = new DataTransfer();
          // list.items.add(rf_file);
          // this.selectedFiles = list.files;
        }
      }
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
    debugger;
    const dialogRef = this.dialog.open(ModalFirmaPeruComponent,{
      width: '90%',
      height: '95%',

      data: { documento }
    });

  }



  _window(): any {
    // return the global native browser window object
    return window;
  }

  firmarDocumento(){
    this.cargando = true;
    this.documentoService.firmarDocumento(this.selectedFiles[0]).subscribe((response:any)=>{

       this._window().iniciarFirma(response[1]);
    });
    this.cargando = false;
  }

  selectAnexos(event: any): void {
    this.uploadedFiles = event.target.files;
    // for (let i = 0; i < files.length; i++) {
    //   this.uploadedFiles.push(files[i]);
    // }
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

}
