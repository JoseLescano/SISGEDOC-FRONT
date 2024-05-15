import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, map } from 'rxjs';
import { Clase } from 'src/app/_model/clase';
import { Organizacion } from 'src/app/_model/organizacion';
import { ClaseService } from 'src/app/_service/clase.service';
import { OrganizacionService } from 'src/app/_service/organizacion.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

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
  url_pdf = '';

  // =======================================================================================================

  constructor(private organizacionService: OrganizacionService,
              private claseService: ClaseService) { }

  ngOnInit(): void {
    this.cargando = true;
    this.initForm();
    this.organizacionService.findFirmantes(environment.codigoOrganizacion).subscribe((response:any)=>  {
      this.firmantes = response.data
    });
    // this.firmanteFilter$ = this.firmanteControl.valueChanges.pipe(map(val => this.filterfirmantes(val)));
    this.claseService.findForCrearDocumento().subscribe((response:any)=> this.clases = response.data );    
    this.cargando = false;
  }

  // =======================================================================================================

  initForm(){
    this.form = new FormGroup({
      'firmante': new FormControl('', [Validators.required]),
      'tipoDocumento': new FormControl('', [Validators.required]),
      'nroCorrelativo': new FormControl(null, [Validators.required, Validators.min(1)]),
      'indicativo': new FormControl('', [Validators.required]),
      'destinatarios': new FormControl(new Array<String>,[Validators.required]),
      'copiaInformativa': new FormControl(new Array<String>),
      'asunto': new FormControl('', [Validators.required, Validators.minLength(10)]),
      // 'observaciones': new FormControl(''),
    });

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
  }


  getIndicativo(){
    let organizacion  = this.form.get('firmante').value;
    // const selectedOption = this.firmantes.find(option => option.codigoInterno.includes(event.option.value ));
    this.form.get('indicativo').setValue(organizacion.indicativo);
  }


  operate(){

  }


  validarPlantilla(){

    var firmante = this.form.get('firmante').value != null && this.form.get('firmante').value != '' ;
    var tipoDocumento = this.form.get('tipoDocumento').value != null && this.form.get('tipoDocumento').value != '' ;
    var indicativo = this.form.get('indicativo').value != null && this.form.get('indicativo').value != '' ;
    var destinatarios = this.form.get('destinatarios').value != null && this.form.get('destinatarios').value != '' ;
    debugger;
    if (!firmante || !tipoDocumento || !indicativo || !destinatarios ) {
      Swal.fire('Datos incompletos', `Complete todos los campos para generar plantilla de Word`, 'error');
      return false;
    } else {
      return true;
    }

  }

  generarPlantilla(){

    this.validarPlantilla();

  }

  get nativeDocument(): any {
    return document;
  }

  agregarArchivo() {
    this.nativeDocument.getElementById('documentoPrincipal').click();
  }

  selectArchivoPrincipal(event: any): void {
    const fileTemp = event.target.files[0];
      const fileType = fileTemp.type;
      if (fileType !== 'application/pdf') {
        event.target.value = ''; // Borra la selección del archivo
        this.selectedFiles=null;
        Swal.fire('Lo sentimos', `Debe de seleccionar un documento PDF`, 'info');
      }else{
        if(event.target.files.length>0){
          this.selectedFiles = event.target.files;
          this.url_pdf = this.selectedFiles[0].name;
          this.selectedFiles = event.target.files;
          environment.cantidadPaginasPDF(this.selectedFiles[0],
            (cpages:any)=>{
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

    fileInIframe(file:any,idFrame:any){
      let fileURL = URL.createObjectURL(file);
      this.url_pdf = fileURL;
      let iframe: any = document.getElementById(''+idFrame) as HTMLIFrameElement;
      iframe.contentWindow.location.replace(fileURL);
    }

  limpiar(){
    this.form.reset();
  }

}
