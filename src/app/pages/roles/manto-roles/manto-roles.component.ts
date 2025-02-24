import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { switchMap } from 'rxjs';
import { Rol } from 'src/app/_model/rol';
import { RoleService } from 'src/app/_service/role.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manto-rol',
  templateUrl: './manto-roles.component.html',
  styleUrls: ['./manto-roles.component.css']
})
export class MantoRolComponent implements OnInit {

  rol: Rol;
  titulo : String = 'NUEVA ROL';
  form : FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: Rol,
    private matDialog: MatDialogRef<MantoRolComponent>,
    private roLService: RoleService
  ) { }

  ngOnInit(): void {
    this.rol = {...this.data};
    this.initForm();
  }

  close(){
    this.matDialog.close();
  }

  initForm(){
    if (this.rol.codigo == ''){
      this.form = new FormGroup({
        'codigo': new FormControl('', [Validators.required, Validators.maxLength(3), Validators.minLength(3)]),
        'nombre': new FormControl('', [Validators.required]),
      })
    }else {
      this.titulo = 'ACTUALIZAR ROL';
      this.form = new FormGroup({
        'codigo': new FormControl(this.rol.codigo, [Validators.required,  Validators.maxLength(3), Validators.minLength(3)]),
        'nombre': new FormControl(this.rol.nombre, [Validators.required,  Validators.minLength(5)]),
      })
    }
  }

  operate(){
    if (this.form.valid){
      if (this.rol.codigo != null && this.rol.codigo != ''){
        debugger;
        this.rol.codigo = this.form.value['codigo'];
        this.rol.nombre = this.form.value['nombre'];
        this.roLService.modificar(this.rol).pipe(
          switchMap((response: any) => {
            debugger;
            return this.roLService.listar();
          })
        ).subscribe(
          {
            next : (respuestaLista:any) => {
              debugger;
              this.roLService.setRoleChange(respuestaLista)
              Swal.fire('Rol actualizado',
                `Rol '${this.rol.codigo}', fue actualizado con éxito!`,
                'success');
              this.close();
            },
            error: (err: any)=> {
              debugger
              console.log(err);

            }
          }
        )
      } else {
        debugger;
        this.rol.codigo = this.form.value['codigo'];
        this.rol.nombre = this.form.value['nombre'];
        this.roLService.registrar(this.rol).pipe(
          switchMap((response: any) => {
            debugger;
            return this.roLService.listar();
          })
        ).subscribe(
          {
            next : (respuestaLista:any) => {
              debugger;
              this.roLService.setRoleChange(respuestaLista)
              Swal.fire('Se registro rol correctamente',
                `Rol '${this.rol.codigo}', registrado!`,
                'success');
              this.close();
            },
            error: (err: any)=> {
              debugger
              console.log(err);

            }
          }
        )
      }
    } else {

    }
  }

}
