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
  cargando : boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ValidarRecojoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private personaService:PersonaService,
    private correspondenciaService: CorrespondenciaService
  ) { }

  ngOnInit(): void {
    console.log(this.data);
  }

  close(){
    this.dialogRef.close();
  }

  validarCredenciales(){
    this.cargando = true;
    if ( this.usuario != null &&  this.password != null){
      this.correspondenciaService.entregaCorrespondencia(
        sessionStorage.getItem(environment.codigoOrganizacion),
        this.usuario, this.password,
        this.data.lista).subscribe({
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
