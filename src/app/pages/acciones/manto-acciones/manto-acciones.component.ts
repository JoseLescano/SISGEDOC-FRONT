import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { switchMap } from 'rxjs';
import { Accion } from 'src/app/_model/accion';
import { AccionService } from 'src/app/_service/accion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manto-acciones',
  templateUrl: './manto-acciones.component.html',
  styleUrls: ['./manto-acciones.component.css']
})
export class MantoAccionesComponent implements OnInit {

  accion: Accion = new Accion();
  titulo : String = 'NUEVA ACCION';
  form : FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: Accion,
    private matDialog: MatDialogRef<MantoAccionesComponent>,
    private accionService: AccionService
  ) { }

  ngOnInit(): void {
    this.accion = {...this.data};
    this.initForm();
  }

  close(){
    this.matDialog.close();
  }

  initForm(){
    if (this.accion.codigo == ''){
      this.form = new FormGroup({
        'codigo': new FormControl('', [Validators.required, Validators.maxLength(4), Validators.minLength(4)]),
        'nombre': new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(25)]),
      })
    }else {
      this.titulo = 'ACTUALIZAR ACCION';
      this.form = new FormGroup({
        'codigo': new FormControl(this.accion.codigo, [Validators.required,  Validators.maxLength(4), Validators.minLength(4)]),
        'nombre': new FormControl(this.accion.nombre, [Validators.required,  Validators.maxLength(25), Validators.minLength(5)]),
      })
    }
  }

  operate(){
    if (this.form.valid){
      if (this.accion.codigo != null && this.accion.codigo != ''){
        debugger;
        this.accion.codigo = this.form.value['codigo'];
        this.accion.nombre = this.form.value['nombre'];
        this.accionService.modificar(this.accion).pipe(
          switchMap((response: any) => {
            debugger;
            return this.accionService.listar();
          })
        ).subscribe(
          {
            next : (respuestaLista:any) => {
              debugger;
              this.accionService.setAccionCambio(respuestaLista.data)
              Swal.fire('Accion actualizada',
                `Accion '${this.accion.codigo}', fue actualizado con éxito!`,
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
        this.accion.codigo = this.form.value['codigo'];
        this.accion.nombre = this.form.value['nombre'];
        this.accionService.registrar(this.accion).pipe(
          switchMap((response: any) => {
            debugger;
            return this.accionService.listar();
          })
        ).subscribe(
          {
            next : (respuestaLista:any) => {
              debugger;
              this.accionService.setAccionCambio(respuestaLista.data)
              Swal.fire('Se registro accion correctamente',
                `Accion '${this.accion.codigo}', registrado!`,
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
