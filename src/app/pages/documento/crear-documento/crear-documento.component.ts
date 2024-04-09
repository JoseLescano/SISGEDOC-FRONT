import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, map } from 'rxjs';
import { Clase } from 'src/app/_model/clase';
import { Organizacion } from 'src/app/_model/organizacion';
import { ClaseService } from 'src/app/_service/clase.service';
import { OrganizacionService } from 'src/app/_service/organizacion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-documento',
  templateUrl: './crear-documento.component.html',
  styleUrls: ['./crear-documento.component.css']
})
export class CrearDocumentoComponent implements OnInit {

  form:FormGroup;

  // firmanteControl:FormControl;
  // firmanteFilter$:Observable<Organizacion[]>;
  firmantes:Organizacion[];

  organizacionesDestino:Organizacion[];
  copiasInformativas:Organizacion[];
  tipoDocumentos:Clase[];
  indicativo:string="";

  clases:Clase[];

  codigoOrganizacion:any='33';

  // =======================================================================================================

  constructor(private organizacionService: OrganizacionService,
              private claseService: ClaseService) { }

  ngOnInit(): void {
    this.initForm();
    this.organizacionService.findFirmantes(this.codigoOrganizacion).subscribe((response:any)=>  this.firmantes = response.data );
    // this.firmanteFilter$ = this.firmanteControl.valueChanges.pipe(map(val => this.filterfirmantes(val)));
    this.claseService.findByOrganizacionDestino().subscribe((response:any)=> this.clases = response.data );
    this.organizacionService.destinatariosExternoByCodigo(this.codigoOrganizacion).subscribe((response:any)=> {
      this.organizacionesDestino = response.data;
      this.copiasInformativas = response.data;
    });
  }

  // =======================================================================================================

  initForm(){
    // this.firmanteControl = new FormControl('', [Validators.required]);

    this.form = new FormGroup({
      'firmante': new FormControl('', [Validators.required]),
      'tipoDocumento': new FormControl('', [Validators.required]),
      'nroCorrelativo': new FormControl(null, [Validators.required, Validators.min(1)]),
      'indicativo': new FormControl('', [Validators.required]),
      'destinatarios': new FormControl(new Array<String>,[Validators.required]),
      'copiaInformativa': new FormControl(new Array<String>),
      'asunto': new FormControl('', [Validators.required, Validators.minLength(10)]),
      'observaciones': new FormControl(''),
    });

    this.form.controls['nroCorrelativo'].disable();

  }

  // filterfirmantes(val: any){
  //   if(val.vid>0){
  //     return this.firmantes.filter(el =>
  //       el.acronimo.toLowerCase().includes(val.acronimo.toLowerCase()));
  //   }else {
  //     return this.firmantes.filter(el =>
  //       el.acronimo.toLowerCase().includes(val?.toLowerCase()));
  //   }
  // }


  getIndicativo(){
    let organizacion  = this.form.get('firmante').value;
    // const selectedOption = this.firmantes.find(option => option.codigoInterno.includes(event.option.value ));
    this.form.get('indicativo').setValue(organizacion.indicativo);
  }


  // showFirmantes(val: any){
  //   return val ? `${val.acronimo}`: val;
  // }

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

}
