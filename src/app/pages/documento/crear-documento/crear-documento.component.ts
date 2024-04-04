import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable, map } from 'rxjs';
import { Clase } from 'src/app/_model/clase';
import { Organizacion } from 'src/app/_model/organizacion';
import { ClaseService } from 'src/app/_service/clase.service';
import { OrganizacionService } from 'src/app/_service/organizacion.service';

@Component({
  selector: 'app-crear-documento',
  templateUrl: './crear-documento.component.html',
  styleUrls: ['./crear-documento.component.css']
})
export class CrearDocumentoComponent implements OnInit {

  form:FormGroup;

  firmanteControl:FormControl;
  firmanteFilter$:Observable<Organizacion[]>;
  firmantes:Organizacion[];

  organizacionesDestino:Organizacion[];
  copiasInformativas:Organizacion[];
  tipoDocumentos:Clase[];
  indicativo:string="";

  clases:Clase[];

  // =======================================================================================================

  constructor(private organizacionService: OrganizacionService,
              private claseService: ClaseService) { }

  ngOnInit(): void {
    this.initForm();
    this.organizacionService.findFirmantes('3302010102').subscribe((response:any)=> {
      this.firmantes = response.data;
    });
    this.firmanteFilter$ = this.firmanteControl.valueChanges.pipe(map(val => this.filterfirmantes(val)));
    this.claseService.listar().subscribe((response:any)=>{
      debugger;
      this.clases = response.data
    });
  }

  // =======================================================================================================

  initForm(){
    this.firmanteControl = new FormControl('', [Validators.required]);

    this.form = new FormGroup({
      'firmante': this.firmanteControl,
      'indicativo': new FormControl('', [Validators.required]),
      'asunto': new FormControl('', [Validators.required]),
      'observaciones': new FormControl('', [Validators.required]),
    });

  }

  filterfirmantes(val: any){
    if(val.vid>0){
      return this.firmantes.filter(el => 
        el.acronimo.toLowerCase().includes(val.acronimo.toLowerCase()));
    }else {
      return this.firmantes.filter(el => 
        el.acronimo.toLowerCase().includes(val?.toLowerCase()));
    }
  }


  getIndicativo(organizacionSeleccionado: Organizacion){
    this.form.get('indicativo').setValue('');
    debugger;
    // const selectedOption = this.firmantes.find(option => option.codigoInterno.includes(event.option.value ));
    this.form.get('indicativo').setValue(organizacionSeleccionado.indicativo);
  }


  showFirmantes(val: any){
    return val ? `${val.acronimo}`: val;
  }

  operate(){

  }

}
