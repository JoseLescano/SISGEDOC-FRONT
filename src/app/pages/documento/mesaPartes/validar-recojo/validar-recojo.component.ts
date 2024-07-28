import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CorrespondenciaService } from 'src/app/_service/correspondencia.service';
import { PersonaService } from 'src/app/_service/persona.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-validar-recojo',
  templateUrl: './validar-recojo.component.html',
  styleUrls: ['./validar-recojo.component.css']
})
export class ValidarRecojoComponent implements OnInit {

  usuario:any;
  password:any;
  motivo: string = "";
  cargando : boolean = false;
  tipoOperacion: any= 0;

  constructor(
    public dialogRef: MatDialogRef<ValidarRecojoComponent>,
    @Inject(MAT_DIALOG_DATA) public dataEnviada: any,
    private personaService:PersonaService,
    private correspondenciaService: CorrespondenciaService
  ) { }

  ngOnInit(): void {
    console.log(this.dataEnviada);
    this.tipoOperacion = this.dataEnviada.tipoOperacion;
  }

  close(){
    this.dialogRef.close();
  }

  validarCredenciales(){
    let correspondencia = this.dataEnviada.data.lista;
    this.cargando = true;
    if ( this.usuario != null &&  this.password != null){
      this.correspondenciaService.entregaCorrespondencia(
        sessionStorage.getItem(environment.codigoOrganizacion),
        this.usuario, this.password,
        correspondencia).subscribe({
          next : (response:any)=>{
            if (response.httpStatus == "OK"){
              this.cargando = false;
              Swal.fire('VALIDACIÓN CORRECTA', 'SE PROCEDERÁ A ENTREGAR CORRESPONDENCIA', 'success');

            } else {
              this.cargando = false;
              Swal.fire('LO SENTIMOS', response.message, 'warning');
            }
          },
          error: (err: any) => {
            this.cargando = false;
            Swal.fire('LO SENTIMOS', "SE PRESENTO UN INCONVENIENTE", 'warning');
          }
        });
    } else {
      this.cargando = false;
      Swal.fire('LO SENTIMOS', "INGRESE USUARIO Y CONTRASEÑA DEL USUARIO RECEPTOR", 'warning');
    }
  }

}
