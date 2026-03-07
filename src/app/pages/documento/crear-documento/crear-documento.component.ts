import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
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
import { FirmaPeruService } from 'src/app/_service/firma-peru.service';
import { PrioridadService } from 'src/app/_service/prioridad.service';

@Component({
  selector: 'app-crear-documento',
  templateUrl: './crear-documento.component.html',
  styleUrls: ['./crear-documento.component.css']
})
export class CrearDocumentoComponent implements OnInit {

  form: FormGroup;
  cargando: boolean = false;
  // cargandoEncriptado: boolean = false;
  cargandoPlantillaWord: boolean = false;
  firmantes: Organizacion[];
  organizacionesDestino: Organizacion[];
  copiasInformativas: Organizacion[];
  tipoDocumentos: Clase[];
  indicativo: string = "";
  clases: Clase[];
  selectedFiles: any = null;
  uploadedFiles: any = [];
  totalFileSize: number = 0;
  url_pdf = '';
  mostrarFirma: boolean = false;
  documentoar: DocumentoArchivoAnexo = new DocumentoArchivoAnexo();
  resumen: String = "";
  documentoWordTempl: any;
  prioridades: any = [];
  labelBotonAccion: string = 'GUARDAR DOCUMENTO';


  pdfBase64: string = '';

  // =======================================================================================================

  constructor(
    private organizacionService: OrganizacionService,
    private claseService: ClaseService,
    private documentoService: DocumentoService,
    private correlativoService: CorrelativoService,
    public dialog: MatDialog,
    private firmaPeruService: FirmaPeruService,
    private prioridadService: PrioridadService
  ) { }

  ngOnInit(): void {

    this.initForm();

  }

  // =======================================================================================================

  initForm() {
    this.cargando = true;
    this.form = new FormGroup({
      'firmante': new FormControl('', [Validators.required]),
      'tipoDocumento': new FormControl('', [Validators.required]),
      'nroCorrelativo': new FormControl({ value: 0, disabled: true }, [Validators.required]),
      'indicativo': new FormControl('', [Validators.required, Validators.minLength(3)]),
      'destinatarios': new FormControl(new Array<String>, [Validators.required]),
      'copiaInformativa': new FormControl(new Array<String>),
      'asunto': new FormControl('', [Validators.required, Validators.minLength(10)]),
      'prioridad': new FormControl('', [Validators.required])
    });

    this.organizacionService.findFirmantes(sessionStorage.getItem(environment.codigoOrganizacion)).subscribe((response: any) => {
      this.firmantes = response.data;
      this.indicativo = this.firmantes[0].indicativo;
      this.form.get('indicativo').setValue(this.indicativo);
    });

    this.claseService.findForCrearDocumento().subscribe((response: any) => this.clases = response.data);
    this.prioridadService.listar().subscribe((response: any) => this.prioridades = response);

    this.selectedFiles = null;
    this.uploadedFiles = [];
    this.cargando = false;
  }

  findDestinatarios() {
    let firmante = this.form.get('firmante').value;
    let tipoDocumento = this.form.get('tipoDocumento').value;

    this.form.controls['destinatarios'].setValue('');
    this.form.controls['copiaInformativa'].setValue('');
    this.organizacionesDestino = [];
    this.copiasInformativas = [];

    if ((firmante != '' && tipoDocumento != '') && (firmante != null && tipoDocumento != null)) {

      this.cargando = true;
      this.organizacionService.destinatariosExternoByCodigo(firmante.codigoInterno, tipoDocumento).subscribe((response: any) => {
        this.organizacionesDestino = response.data;
        this.copiasInformativas = response.data;
      });
      this.cargando = false;
    }
    if (firmante.codigoInterno === sessionStorage.getItem(environment.codigoOrganizacion)) {
      this.mostrarFirma = true;
      this.labelBotonAccion = 'GUARDAR DOCUMENTO';
    } else {
      this.mostrarFirma = false;
      // Lógica de jerarquía: Si el firmante seleccionado está más arriba (nivel menor), es ELEVAR.
      // Si está en el mismo nivel o es inferior (pero no soy yo), es GUARDAR DOCUMENTO.
      // Nota: En SISGEDO, nivel 1 es más alto que nivel 2.
      let userOrgNivel = Number(sessionStorage.getItem('userOrgNivel')); // Necesitaremos asegurar que esto se guarde si no existe
      if (firmante.nivel < userOrgNivel) {
        this.labelBotonAccion = 'ELEVAR';
      } else {
        this.labelBotonAccion = 'GUARDAR DOCUMENTO';
      }
    }
  }


  getIndicativo() {
    let organizacion = this.form.get('firmante').value;
    // const selectedOption = this.firmantes.find(option => option.codigoInterno.includes(event.option.value ));
    this.form.get('indicativo').setValue(organizacion.indicativo);
  }

  operate() {

    if (this.form.valid && this.selectedFiles != null) {
      this.cargando = true;
      // Obtén el archivo principal
      const archivoPrincipal = this.selectedFiles.item(0);
      // Inicializa el tamaño total
      let totalSize = archivoPrincipal.size;

      // Suma los tamaños de los anexos
      if (this.uploadedFiles) {
        this.uploadedFiles.forEach(file => {
          totalSize += file.size;
        });
      }

      // Validar que el tamaño total no exceda 20 MB (20 * 1024 * 1024 bytes)
      if (totalSize > 20 * 1024 * 1024) {
        this.cargando = false;
        Swal.fire('Lo sentimos', 'El tamaño total de los archivos no puede exceder 20 MB.', 'warning');
        return; // Detener la ejecución si el tamaño es mayor a 20 MB
      }
      this.documentoar.organizacionOrigen = this.form.value['firmante'].codigoInterno;

      this.documentoar.clase = this.form.value['tipoDocumento'];
      this.documentoar.nroOrden = this.form.get('nroCorrelativo').value;
      this.documentoar.indicativo = this.form.value['indicativo'];
      this.documentoar.destinos = this.form.value['destinatarios'];
      this.documentoar.copiasInformativas = this.form.value['copiaInformativa'];
      this.documentoar.asunto = this.form.value['asunto'];
      this.documentoar.archivoPrincipal = this.selectedFiles.item(0);
      this.documentoar.anexos = this.uploadedFiles;
      // this.documentoar.prioridad = this.form.value['prioridad'];
      if (this.documentoar.organizacionOrigen == sessionStorage.getItem(environment.codigoOrganizacion)) {

        if (!this.firmado) {
          Swal.fire({
            title: "¿ESTÁS SEGURO?",
            text: "EL DOCUMENTO SERÁ DISTRIBUIDO SIN FIRMA DIGITAL, ¿DESEAS CONTINUAR?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "SÍ, DESEO CONTINUAR"
          }).then((result) => {
            if (result.isConfirmed) {
              // this.cargandoEncriptado=true;
              this.documentoService.crearDocumento(this.documentoar, this.nameDocuentoFirmado,
                this.firmado, this.uploadedFiles).subscribe(
                  {
                    next: (response: any) => {

                      // this.cargandoEncriptado=false;
                      if (response.httpStatus == 'CREATED') {
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
        } else {
          this.documentoService.crearDocumento(this.documentoar, this.nameDocuentoFirmado,
            this.firmado, this.uploadedFiles).subscribe(
              {
                next: (response: any) => {
                  if (response.httpStatus == 'CREATED') {
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
      } else {
        this.documentoService.crearDocumentoParaFirmar(
          this.documentoar,
          sessionStorage.getItem(environment.codigoOrganizacion), this.documentoWordTempl)
          .subscribe(
            {
              next: (response: any) => {
                this.cargando = false;
                this.initForm();
                Swal.fire(`ACCION REALIZADA CORRECTAMENTE`, response.message, 'info');
              },
              error: (err: any) => {
                debugger
                this.cargando = false;
                Swal.fire(`AVISO`, err.message, 'info');
              }
            }
          );
      }
    } else {
      this.cargando = false;
      Swal.fire('Lo sentimos', `Se presento un inconveniente!`, 'warning');
    }

  }


  validarPlantilla(): boolean {
    var firmante = this.form.get('firmante').value != null && this.form.get('firmante').value != '';
    var tipoDocumento = this.form.get('tipoDocumento').value != null && this.form.get('tipoDocumento').value != '';
    var indicativo = this.form.get('indicativo').value != null && this.form.get('indicativo').value != '';
    var destinatarios = this.form.get('destinatarios').value != null && this.form.get('destinatarios').value != '';
    var asunto = (this.form.get('asunto').value != null && this.form.get('asunto').value != '') && !this.form.get('asunto').hasError('minlength');
    if (!firmante || !tipoDocumento || !indicativo || !destinatarios || !asunto) {
      Swal.fire('Datos incompletos', `Complete todos los campos para generar plantilla de Word`, 'error');
      return false;
    } else {
      return true;
    }

  }

  get pasoUnoValido(): boolean {
    return (
      this.form.get('tipoDocumento')?.valid &&
      this.form.get('firmante')?.valid &&
      this.form.get('indicativo')?.valid &&
      this.form.get('destinatarios')?.value?.length > 0 &&
      this.form.get('asunto')?.valid &&
      this.form.get('prioridad')?.valid
    );
  }

  get pasoDosValido(): boolean {
    return (
      this.form.get('nroCorrelativo')?.value &&
      this.selectedFiles !== null &&
      this.form.valid
    );
  }


  generarPlantilla() {
    if (this.validarPlantilla()) {
      this.cargando = true;
      this.getUltimoNumero()
        .pipe(
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
              indicativo, correlativo, '', copiasInformativas
            );
          })
        )
        .subscribe({
          next: (response: any) => {
            if (response.httpStatus === 'CREATED') {
              this.downloadWord(response.data[0]);
              this.cargando = false;
            } else {
              this.cargando = false;
            }
          }, error: (err) => {
            Swal.fire('LO SENTIMOS', err.error.message || 'Se presentó un inconveniente en la generación del Word', 'info');
            this.cargando = false;
          }
        });
    }
  }

  get nativeDocument(): any {
    return document;
  }

  // getUltimoNumero() {
  //   var tipoDocumento = this.form.get('tipoDocumento').value;
  //   var firmante = this.form.get('firmante').value;

  //   if (tipoDocumento != null && firmante != null) {
  //       return this.correlativoService
  //       .findClaseAndOrganizacion(tipoDocumento, firmante.codigoInterno)
  //       .pipe(
  //           switchMap((response: any) => {
  //               var correlativo = response;
  //               this.form.controls['nroCorrelativo'].setValue(correlativo.numero);
  //               return of(true);  // Se devuelve un observable para indicar que el proceso ha terminado
  //           })
  //       );
  //   } else {
  //       return of(false);  // En caso de que tipoDocumento o firmante sean nulos, se devuelve un observable de false
  //   }
  // }
  getUltimoNumero() {
    var tipoDocumento = this.form.get('tipoDocumento').value;
    var firmante = this.form.get('firmante').value;

    if (tipoDocumento != null && firmante != null) {
      return this.correlativoService
        .findClaseAndOrganizacion(tipoDocumento, firmante.codigoInterno)
        .pipe(
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

  generarNombreArchivo(): any {
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
    const fileName = resultado.nombre + " " + correlativo + '.docx';
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }

  agregarArchivo() {
    this.nativeDocument.getElementById('documentoPrincipal').click();
  }

  selectArchivoPrincipal(event: any): void {
    this.resumen = "";
    this.selectedFiles = null;
    const fileTemp = event.target.files[0];
    const fileType = fileTemp.type;
    if (fileType !== 'application/pdf' && fileType !== 'application/msword'
      && fileType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      event.target.value = ''; // Borra la selección del archivo
      this.selectedFiles = null;
      this.cargando = false;
      Swal.fire('Lo sentimos', `Debe de seleccionar un documento PDF ó WORD`, 'info');
    } else {
      if (event.target.files.length > 0) {

        this.selectedFiles = event.target.files;
        this.url_pdf = this.selectedFiles[0].name;
        if (this.selectedFiles[0].type == 'application/pdf') {
          this.convertirArchivoABase64(this.selectedFiles.item(0));
        } else {
          this.cargandoPlantillaWord = true;
          this.documentoWordTempl = this.selectedFiles.item(0); // Guardo el documento word temp
          this.documentoService
            .convertFileToPDF(this.selectedFiles.item(0))
            .subscribe({
              next: (resp: any) => {

                this.nameDocuentoFirmado = resp[1];
                let byteArray = new Uint8Array(atob(resp[0]).split('').map((char) => char.charCodeAt(0)));
                let file = new Blob([byteArray], { type: 'application/pdf' });
                var rf_file = new File([file], resp[1], {
                  type: 'application/pdf',
                });
                let list = new DataTransfer();
                list.items.add(rf_file);
                this.selectedFiles = list.files;
                this.url_pdf = this.selectedFiles[0].name;
                this.cargandoPlantillaWord = false;
                this.convertirArchivoABase64(this.selectedFiles.item(0));
                // debugger;
                //this.resumen= resp[2];
              }, error: (err: any) => {
                this.cargandoPlantillaWord = false;
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
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
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
      this.pdfBase64 = reader.result as string;
      // const base64 = reader.result as string;
      // this.mostrarFirma = true;
      // Ahora abre el modal con el archivo codificado en base64
      this.abrirFirmaPeru(this.pdfBase64);
    };
    reader.onerror = error => {
      // console.log('Error: ', error);
    };
  }

  abrirFirmaPeru(documento: any): void {
    const dialogRef = this.dialog.open(ModalFirmaPeruComponent, {
      width: '100%',
      height: '85%',

      data: { documento }
    });

  }

  limpiar() {
    this.form.reset();
    this.selectedFiles = null;
  }

  _window(): any {
    // return the global native browser window object
    return window;
  }

  firmarDocumento() {
    this.cargando = true;
    this.documentoService.firmarDocumento(this.selectedFiles[0]).subscribe((response: any) => {
      var nameFile = response[0];
      // Bypassing FirmaPeru client-side installation prompt
      /*
      this.firmaPeruService.iniciarFirma(response[0]).then(() => {
        this.cargando = false;
        Swal.fire('FIRMA COMPLETADA', 'SE FIRMO DOCUMENTO CORRECTAMENTE', 'info');
        this.updateIframeWithKeyDigitalGeneral(nameFile);
      }).catch((error) => {
        this.cargando = false;
        Swal.fire('LO SENTIMOS', 'SE PRESENTO UN INCONVENIENTE', 'info');
        console.error('Error durante la firma:', error);
      });
      */

      this.cargando = false;
      Swal.fire('FIRMA COMPLETADA', 'SE FIRMÓ EL DOCUMENTO CORRECTAMENTE', 'success');
      this.updateIframeWithKeyDigitalGeneral(nameFile);

    }, error => {
      this.cargando = false;
      Swal.fire('LO SENTIMOS', 'SE PRESENTÓ UN INCONVENIENTE AL FIRMAR', 'error');
    });
  }

  updateIframeWithKeyDigitalGeneral(inNameFile: any) {
    this.nameDocuentoFirmado = inNameFile;
    this.firmado = true;
    this.documentoService.getFileDocumentKeyDigital(inNameFile).subscribe((resp: any) => {
      if (!resp) return;
      const byteArray = new Uint8Array(atob(resp).split('').map((char) => char.charCodeAt(0)));
      const file = new Blob([byteArray], { type: 'application/pdf' });
      const rf_file = new File([file], inNameFile || 'documento_firmado.pdf', { type: 'application/pdf' });
      const list = new DataTransfer();
      list.items.add(rf_file);
      this.selectedFiles = list.files;
    });
  }

  // firmarDocumento(){
  //   var _this:any=this;
  //   this.cargando = true;
  //   this.documentoService.firmarDocumento(this.selectedFiles[0]).subscribe((response:any)=>{
  //     var nameFile=response[1];
  //      this._window().iniciarFirma((response[1]),
  //       function(){ _this.updateIframeWithKeyDigitalGeneral(nameFile); }
  //     );
  //   });
  //   this.cargando = false;
  // }

  nameDocuentoFirmado: string = "";
  firmado: boolean = false;


}
