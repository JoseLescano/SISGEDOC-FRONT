import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CorrecionService } from './../../../../_service/correcion.service';
import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { CorrecionDTO } from 'src/app/_DTO/CorrecionDTO';
import { DecretoService } from 'src/app/_service/decreto.service';
import { DocumentoRespuestaService } from 'src/app/_service/documento-respuesta.service';
import { DocumentoService } from 'src/app/_service/documento.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-form-corregir',
  templateUrl: './form-corregir.component.html',
  styleUrls: ['./form-corregir.component.css']
})
export class FormCorregirComponent implements OnInit {

  url_pdf: any;
  vidDocumento:any;
  observaciones : any = '';
  selectedFiles: any;
  errorPDF : boolean = false;
  correciones: CorrecionDTO[] = [];
  cambioPDF : boolean = false;
  decretoId:any=0;
  cargando : boolean = false;
  decreto : any = '';
  formCorregir!: FormGroup;
  formEnviar!: FormGroup;

  constructor(
    private documentoService:DocumentoService,
    private decretoService:DecretoService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private correcionService: CorrecionService,
    private respuesta : DocumentoRespuestaService) {

    }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.getIdDocumento();
    this.findByIdDecreto();
  }

  inicializarFormulario(): void {
    this.formCorregir = this.fb.group({
      observaciones: ['', [Validators.required, Validators.minLength(5) ]],
      archivo: [null, Validators.required]
    });
  }

  inicializarFormularioEnviar(): void {
    this.formEnviar = this.fb.group({
      'codigoDocumento': new FormControl(this.vidDocumento, [Validators.required]),
      'idDecreto': new FormControl(this.decretoId, [Validators.required]),
      'observacionesEnviar': new FormControl('', [Validators.required, Validators.minLength(5)])
    });
  }

  findByIdDecreto(){
    this.decretoService.listarPorId(this.decretoId)
    .subscribe(
      {
        next:(response:any)=> {
          console.log(response)
          debugger
          this.decreto = response;
          // Solo se crea si vidReferencia no es vacío o nulo
          if (this.decreto.vidReferencia || this.decreto.estado.codigo!=20) {
            this.inicializarFormularioEnviar();
          }
        },error :(err:any)=> {
          console.log(err);
        }
      }
    );;
  }

  getIdDocumento(): void {
    const id = +this.route.snapshot.paramMap.get('codigoDocumento');
    this.decretoId = +this.route.snapshot.paramMap.get('idDecreto');
    this.vidDocumento = id;
    this.viewDocumento(id);
    this.correcionService.findByDecreto(this.decretoId).subscribe((response:any)=> {
      this.correciones = response;
    })
  }

  viewDocumento(decreto: any){
    this.respuesta.viewPDFByDecreto(this.decretoId).subscribe((response: any)=>{
      this.crearDocumento(response.data, 'embeddedPage');
      this.errorPDF = false;
    }, error => {
      this.errorPDF = true;
      Swal.fire('LO SENTIMOS', `SE PRESENTO UN INCONVENIENTE EN CARGAR PDF!`, 'warning');
    });
  }

  crearDocumento(resp: any, iframeId: string) {
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

  corregirDocumento(): void {
    if (this.formCorregir.valid && this.selectedFiles) {
      const observaciones = this.formCorregir.get('observaciones')!.value;
      const archivo = this.selectedFiles[0];

      this.respuesta.corregirDocumento(this.decretoId, archivo, observaciones)
        .pipe(switchMap((response: any) => {
          debugger
          Swal.fire('ACCION REALIZADA', response.message, 'info');
          this.router.navigate(['/principal/documentos-corregir']);
          return this.documentoService.findForCorregir(sessionStorage.getItem(environment.codigoOrganizacion));
        }))
        .subscribe((data: any) => {
          debugger
          this.documentoService.setDocumentoCambio(data);
        });

    } else {
      this.formCorregir.markAllAsTouched();
      Swal.fire('Lo sentimos', `Debe de ingresar una observación y/o adjuntar documento para continuar con el registro`, 'info');
    }
  }

  seleccionarDocumento(event: any): void {
    this.cambioPDF = true;
    const fileTemp = event.target.files[0];
    const fileType = fileTemp?.type;

    if (!fileTemp || (
        fileType !== 'application/pdf'
    )) {
      event.target.value = '';
      this.selectedFiles = null;
      this.formCorregir.get('archivo')?.setValue(null);
      Swal.fire('Lo sentimos', `Debe de seleccionar un documento PDF`, 'info');
    } else {
      debugger;
      this.selectedFiles = event.target.files;
      this.url_pdf = this.selectedFiles[0].name;
      this.formCorregir.get('archivo')?.setValue(fileTemp); // actualiza form

      if (fileTemp.type === 'application/pdf') {
        this.fileInIframe(fileTemp, 'embeddedPage');
        this.cargando = false;
      } else {
        this.cargando = true;
        this.documentoService.convertFileToPDF(fileTemp)
          .subscribe((resp: any) => {
            this.crearDocumento(resp, 'embeddedPage');
            this.cargando = false;
          }, error => {
            this.cargando = false;
            Swal.fire('Lo sentimos', 'Error al convertir Word a PDF', 'info');
          });
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

  convertirArchivoABase64(file: File) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const base64 = reader.result as string;
    };
    reader.onerror = error => {
        // console.log('Error: ', error);
    };
  }

  enviarACorregir(): void {
    if (this.formEnviar.valid) {
      const observacion = this.formEnviar.get('observacionesEnviar')!.value;
      this.correcionService.registrarCorrecion(this.vidDocumento, this.decretoId, observacion)
      .pipe(switchMap((response: any) => {
        debugger
        Swal.fire('ACCION REALIZADA', response.message, 'success');
        this.documentoService.setDocumentoCambio(response.data);
        this.router.navigate(['/principal/documentos-corregir']);
        this.cargando = false;
        return this.documentoService.findForCorregir(sessionStorage.getItem(environment.codigoOrganizacion));
      }))
      .subscribe({
        next: (data: any) => {
          this.documentoService.setDocumentoCambio(data);
        },
        error: (err: any) => {
          debugger
          this.cargando = false;
          console.error('Error al registrar corrección:', err);
          Swal.fire('Error', err.message || 'Ocurrió un error al registrar la corrección', 'error');
        }
      });
    } else {
      this.formEnviar.markAllAsTouched();
    }
  }



}
