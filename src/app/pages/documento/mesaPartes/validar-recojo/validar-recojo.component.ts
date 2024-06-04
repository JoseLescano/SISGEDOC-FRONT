import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PersonaService } from 'src/app/_service/persona.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-validar-recojo',
  templateUrl: './validar-recojo.component.html',
  styleUrls: ['./validar-recojo.component.css']
})
export class ValidarRecojoComponent implements OnInit {

  usuario:any;
  password:any;

  constructor(
    public dialogRef: MatDialogRef<ValidarRecojoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private personaService:PersonaService
  ) { }

  ngOnInit(): void {
  }

  close(){
    this.dialogRef.close();
  }

  validarCredenciales(){
    this.personaService.validarEntrega(this.usuario, this.password).subscribe((response:any)=>{
      if(response){
        Swal.fire('VALIDACIÓN CORRECTA', 'SE PROCEDERÁ A ENTREGAR CORRESPONDENCIA', 'success');
      }else {
        Swal.fire('LO SENTIMOS', 'VALIDACIÓN INCORRECTA', 'warning');
      }
    }, error=> {
      Swal.fire('LO SENTIMOS', 'USUARIO Y/O CONTRASEÑA INCORRECTAS', 'warning');
    })
  }

}
