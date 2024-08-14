import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { Anexo } from 'src/app/_model/anexo';
import { Documento } from 'src/app/_model/documento.model';
import { AnexoService } from 'src/app/_service/anexo.service';
import { DecretoService } from 'src/app/_service/decreto.service';
import { DocumentoRespuestaService } from 'src/app/_service/documento-respuesta.service';
import { DocumentoService } from 'src/app/_service/documento.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  documento:Documento;
  documentoRespuesta : Documento = null ;
  errorPDF : boolean = false;
  errorPDFReferencia : boolean = false;
  anexos:Anexo[]=[]; // de respuesta o documento remitido
  anexosReferencia: Anexo[] = [];
  selectedFiles: any;
  selectedRespuesta: any;
  url_pdf : any;
  cargando : boolean = false;
  idDocumento: number;
  cambioPDF : boolean = false;

  mostrarRespuesta: boolean = false;
  mostrarDistribuir: boolean = false;
  organizacionLogueada: string = "";
  existeWord : number = 0;
  descargo:boolean = false;
  isFirmado: boolean = false;
  nameDocumentoFirmado : string = "";

  constructor(
    private documentoService:DocumentoService,
    private route: ActivatedRoute,
    private documentoRespuestaService: DocumentoRespuestaService,
    private anexoService: AnexoService,
    private decretoService: DecretoService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('codigoDocumento');
    debugger;
    this.idDocumento = id;
    this.documentoService.findById(this.idDocumento).pipe(switchMap((response:any)=> {
      this.documento = response;
      this.organizacionLogueada = sessionStorage.getItem(environment.codigoOrganizacion);
      this.documentoService.existByDocumento(this.idDocumento).subscribe((response: any )=> {
        this.existeWord = response;
      });
      this.findAnexosByDocumento();
      return this.documentoService.findRespuestaByVidParent(this.idDocumento);
      })).subscribe((responseDocumentoPadre: any)=>{
      if (responseDocumentoPadre!=null){
        debugger;
        this.documentoRespuesta = new Documento();
        this.documentoRespuesta = {...responseDocumentoPadre};
        this.mostrarRespuesta = true;
        if (this.documentoRespuesta.organizacionOrigen.codigoInterno==this.organizacionLogueada){
          this.mostrarDistribuir = true;
        }
        this.documentoService.viewPDF(this.idDocumento).pipe(switchMap((viewDocumento:any)=> {
          this.crearDocumento(viewDocumento.data, 'documentoReferencia');
          debugger;
          return this.documentoService.viewPDF(this.documentoRespuesta.codigo, this.documentoRespuesta.tipoOrganizacion =='R'? '1': '0');
        })).subscribe((responseRespuesta:any)=> {
          debugger;
          this.crearDocumento(responseRespuesta.data, 'documentoRespuesta');
        }, (error:any) => {
          this.errorPDF = true;
          this.cargando = false;
          Swal.fire('LO SENTIMOS', `SE PRESENTO UN INCONVENIENTE EN CARGAR PDF!`, 'warning');
        });
      } else {
        debugger;
        if (this.documento.organizacionOrigen.codigoInterno==this.organizacionLogueada){
          this.mostrarDistribuir = true;
          this.mostrarRespuesta = true;
        }
        this.documentoService.viewPDF(this.documento.codigo).subscribe((response:any)=> {
          this.crearDocumento(response.data, 'documentoRespuesta');
        }, (error:any) => {
          this.errorPDF = true;
          this.cargando = false;
          Swal.fire('LO SENTIMOS', `SE PRESENTO UN INCONVENIENTE EN CARGAR PDF!`, 'warning');
        });
      }
    });
  }

  descargarWordDocumento(){
    this.documentoService.downloadWord(this.idDocumento).subscribe({
      next : (response:any)=> {
        this.downloadWord(response);
        this.descargo = true;
      }, error : (err)=> {
        Swal.fire('LO SENTIMOS', 'SE PRESENTO UN INCONVENIENTE PARA DESCARGAR DOCUMENTO WORD', 'info')
      }
    })
  }

  findAnexosByDocumento(){
    this.anexoService.findByDocumento(this.documento.codigo).subscribe((response:any)=> {
      this.anexos = response.data;
    }, error => {
      Swal.fire('LO SENTIMOS', `SE PRESENTO UN INCONVENIENTE EN CARGAR ANEXOS!`, 'warning');
    });
  }

  crearDocumento(resp: any, iframeId: string) {
    debugger;
    const byteArray = new Uint8Array(atob(resp[0]).split('').map((char) => char.charCodeAt(0)));
    const file = new Blob([byteArray], { type: 'application/pdf' });
    const fileURL = URL.createObjectURL(file);
    const iframe: any = document.getElementById(iframeId) as HTMLIFrameElement;
    iframe.contentWindow.location.replace(fileURL);
    var rf_file = new File([file], URL.createObjectURL(file), { type: 'application/pdf'});
    let listFile = [rf_file];
    let list = new DataTransfer();
    list.items.add(rf_file);
    this.selectedFiles=list.files;
    this.url_pdf = this.selectedFiles[0].name;

  }


  convertirArchivoABase64(file: File) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const base64 = reader.result as string;
    };
    reader.onerror = error => {
        console.log('Error: ', error);
    };
  }

  descargarAnexo(anexo:Anexo){
    this.anexoService.descargarAnexo(anexo).subscribe((resp: any) => {
        if (resp == null){
            Swal.fire('Lo sentimos', `Archivo no disponible y/o no se encuentra`, 'error');
        } else {

          let extension=anexo.url.split('.').pop();
          extension=extension.toUpperCase();

          if(extension=="PDF" ){
            this.downloadPDF(resp[0]);
          }

          if(extension=="DOC" || extension=="DOCX"){
            this.downloadWord(resp[0]);
          }

          if(extension=="XLSX" ||  extension=="XLS"){
            this.downloadExcel(resp[0]);
          }

          if(extension=="PPT" ||  extension=="PPTX"){
            this.downloadPPT(resp[0]);
          }

          if(extension=="RAR" || extension=="rar" ||  extension=="ZIP"){
            this.downloadRar(resp[0]);
          }
        }
    }, error => {
      Swal.fire('LO SENTIMOS', `SE PRESENTO UN INCONVENIENTE EN DESCARGAR ANEXO!`, 'warning');
    });
  }

  downloadPDF(pdf: any) {
    const linkSource = `data:application/pdf;base64,${pdf}`;
    const downloadLink = document.createElement('a');
    const fileName = this.generarNombreArchivo()+'.pdf';
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }
  downloadPPT(ppt: any) {
    const linkSource = `data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,${ppt}`;
    const downloadLink = document.createElement('a');
    const fileName = this.generarNombreArchivo()+'.pptx';
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }

  downloadExcel(excel: any) {
    const linkSource = `data:application/vnd.ms-excel;base64,${excel}`;
    const downloadLink = document.createElement('a');
    const fileName = this.generarNombreArchivo()+'.xlsx';
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }

  generarNombreArchivo() :any{
    const timestamp = new Date().getTime(); // Marca de tiempo actual
    const randomValue = Math.floor(Math.random() * 1000); // Valor aleatorio entre 0 y 999
    const nombreArchivo = `archivo_${timestamp}_${randomValue}`; // Formato del nombre del archivo
    return nombreArchivo;
  }

  downloadRar(rar: any) {

    const byteCharacters = atob(rar);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob:any = new Blob([byteArray], { type: 'application/x-rar-compressed' });

    // Crear un enlace temporal y descargar el archivo
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download =  this.generarNombreArchivo()+'.rar';

    // Simular un clic en el enlace para descargar el archivo
    link.click();
  }


  downloadWord(word: any) {
     const linkSource = `data:application/msword;base64,${word}`;
     const downloadLink = document.createElement('a');
     const fileName = this.generarNombreArchivo()+'.docx';
     downloadLink.href = linkSource;
     downloadLink.download = fileName;
     downloadLink.click();
  }

  close(){
    //
  }

  elevarDocumento(){
    Swal.fire({
      title: "¿ESTÁS SEGURO?",
      text: "EL DOCUMENTO SERÁ ELEVADO PARA EL ESCALON SUPERIOR",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "SÍ, DESEO CONTINUAR"
    }).then((result) => {
      if (result.isConfirmed) {
        if (this.documentoRespuesta==null){ // SIN REFERENCIA

          this.decretoService.elevarDocumento(
            this.documento.codigo,
            sessionStorage.getItem(environment.codigoOrganizacion),
            this.cambioPDF?this.selectedFiles:null)
          .subscribe((response:any)=> {
            if (response.httpStatus=='CREATED'){
              Swal.fire('DOCUMENTO ELEVADO', response.message, 'info');
              this.router.navigate(['/principal/parte-diario']);
            }else {
              Swal.fire('LO SENTIMOS', response.message, 'warning');
            }
          }, (error: any) => {
            Swal.fire('LO SENTIMOS', 'SE PRESENTO UN INCONVENIENTE EN LA ELEVACION DEL DOCUMENTO', 'warning');
          });

        }else { // DOCUMENTO CON REFERENCIA
          this.decretoService.elevarDocumento(
            this.documento.codigo,
            this.organizacionLogueada,
            this.cambioPDF?this.selectedFiles[0]:null,
            this.documentoRespuesta.codigo )
          .subscribe((response:any)=> {
            if (response.httpStatus=='CREATED'){
              Swal.fire('DOCUMENTO ELEVADO', response.message, 'info');
              this.router.navigate(['/principal/parte-diario']);
            }else {
              Swal.fire('LO SENTIMOS', response.message, 'warning');
            }
          }, (error:any)=> {
            Swal.fire('LO SENTIMOS', 'SE PRESENTO UN INCONVENIENTE EN LA ELEVACION DEL DOCUMENTO', 'warning');
          });
        }
      }
    });

  }

  distribuirDocumento(){
    this.decretoService.distrubirDocumento(
      this.documento.codigo,
      sessionStorage.getItem(environment.codigoOrganizacion),
      this.nameDocumentoFirmado,
      this.isFirmado,
      this.cambioPDF?this.selectedFiles[0]:'undefined')
    .subscribe(
      {
        next : (response:any)=> {
          if (response.httpStatus=='CREATED'){
            Swal.fire("ACCION REALIZADA", response.message, "success");
            this.router.navigate(['/principal/parte-diario']);
          }else {
            Swal.fire("LO SENTIMOS", response.message, "warning");
          }
        },
        error: (err: any) => {
          Swal.fire("LO SENTIMOS", "SE PRESENTO UN INCONVENIENTE", "warning");
        }
      });
  }

  distribuirRespuesta(){
    debugger;
    this.decretoService.distrubirRespuestaDocumento(
      this.documentoRespuesta.codigo,
      sessionStorage.getItem(environment.codigoOrganizacion),
      this.nameDocumentoFirmado,
      this.isFirmado,
      this.documento.codigo,
      this.documentoRespuesta.tipoOrganizacion =='R'? '1': '0',
      this.cambioPDF?this.selectedFiles:'undefined')
    .subscribe(
      {
        next: (response:any)=> {
          if (response.httpStatus=='CREATED'){
            Swal.fire("ACCION REALIZADA", response.message, "success");
            this.router.navigate(['/principal/parte-diario']);
          } else {
            Swal.fire("LO SENTIMOS", response.message, "warning");
          }
        },
        error : (err: any)=> {
          Swal.fire("LO SENTIMOS", "SE PRESENTO UN INCONVENIENTE", "warning");
        }
      }
    );
  }

  distribuir(){
    debugger;
    if (this.documentoRespuesta!=null){
      debugger;
      if (!this.isFirmado){
        Swal.fire({
          title: "¿ESTÁS SEGURO?",
          text: "EL DOCUMENTO SERÁ DISTRIBUIDO SIN FIRMA DIGITAL, ¿DESEAS CONTINUAR?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "SÍ, DESEO CONTINUAR"
        }).then((result) => {
          if (result.isConfirmed) {
            debugger;
            this.distribuirRespuesta();
            //this.distribuirDocumento();
          }
        }
       );
      }else {
        this.distribuirRespuesta();
        //this.distribuirDocumento();
      }
    }else {
      if (!this.isFirmado){
        Swal.fire({
          title: "¿ESTÁS SEGURO?",
          text: "EL DOCUMENTO SERÁ DISTRIBUIDO SIN FIRMA DIGITAL, ¿DESEAS CONTINUAR?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "SÍ, DESEO CONTINUAR"
        }).then((result) => {
          if (result.isConfirmed) {
            this.distribuirDocumento();
          }
        });
      }else {
        this.distribuirDocumento();
      }
    }
  }

  _window(): any {
    return window;
  }

  firmarDocumento(){
    var _this:any=this;
      this.documentoService.firmarDocumento(this.selectedFiles[0]).subscribe((response:any)=>{
        var nameFile=response[1];
        this._window().iniciarFirma((response[1]),
        function(){_this.updateIframeWithKeyDigitalGeneral(nameFile);}
      );
      }, error => {
        Swal.fire("LO SENTIMOS", "HUBO UN INCONVENIENTE EN LA FIRMA DEL DOCUMENTO", "info");
      });

  }

  updateIframeWithKeyDigitalGeneral(inNameFile: any) {
    this.cambioPDF = true;
    this.documentoService
      .getFileDocumentKeyDigital(inNameFile)
      .subscribe((resp:any) => {
        this.isFirmado = true;
        this.nameDocumentoFirmado= inNameFile;
        this.crearDocumento(resp,'documentoRespuesta');
      });
  }

  get nativeDocument(): any {
    return document;
  }

  eventClick() {
    this.nativeDocument.getElementById('updateWord').click();
  }

  seleccionarDocumento(event: any): void {
    this.cambioPDF = true;
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
            this.fileInIframe(this.selectedFiles[0], 'documentoRespuesta');
            this.cargando = false;
          }else {
            this.cargando = true;
            this.documentoService
            .convertFileToPDF(this.selectedFiles.item(0))
            .subscribe((resp: any) => {
              this.crearDocumento(resp, 'documentoRespuesta');
              this.cargando = false;
            }, error => {
              this.cargando = false;
              Swal.fire('Lo sentimos', 'Se presento un inconveniente al convertir Word a PDF', 'info');
            });
          }
        }
      }
  }

  updateDocumento(){
    this.documentoService
      .convertFileToPDF(this.selectedFiles.item(0))
      .subscribe((resp: any) => {
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
        this.cambioPDF = true;
      }, error => {
        this.cargando = false;
        Swal.fire('Lo sentimos', 'Se presento un inconveniente al convertir Word a PDF', 'info');
      });
  }

  fileInIframe(file:any,idFrame:any){
    let fileURL = URL.createObjectURL(file);
    this.url_pdf = fileURL;
    let iframe: any = document.getElementById(''+idFrame) as HTMLIFrameElement;
    iframe.contentWindow.location.replace(fileURL);
  }




}
