import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Clase } from 'src/app/_model/clase';
import { Organizacion } from 'src/app/_model/organizacion';
import { ClaseService } from 'src/app/_service/clase.service';
import { OrganizacionService } from 'src/app/_service/organizacion.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css']
})
export class ConfigComponent implements OnInit {

  clases:Clase[] = [];
  firmantes:Organizacion[] = [];
  organizacionesDestino:Organizacion[];
  form:FormGroup;

  constructor(
    private claseService: ClaseService,
    private organizacionService: OrganizacionService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(){
    this.form = new FormGroup({
      'firmante': new FormControl('', [Validators.required]),
      'tipoDocumento': new FormControl('', [Validators.required]),
      'destinatarios': new FormControl(new Array<String>,[Validators.required]),
    });

    this.claseService.findForCrearDocumento().subscribe((response:any)=> this.clases = response.data );
    this.organizacionService.findFirmantes(sessionStorage.getItem(environment.codigoOrganizacion)).subscribe((response:any)=>  {
      this.firmantes = response.data;
    });
  }

  findDestinatarios(){
    debugger
    let firmante = this.form.get('firmante').value;
    let tipoDocumento = this.form.get('tipoDocumento').value;

    this.form.controls['destinatarios'].setValue('');
    this.organizacionesDestino = [];

    if ((firmante!='' && tipoDocumento !='') && (firmante!=null && tipoDocumento !=null)){

      // this.organizacionService.getEmu().subscribe((response:any)=> {
      //   debugger
      //   this.organizacionesDestino = response.data;
      // });
    }
  }

  operate(){}

}
