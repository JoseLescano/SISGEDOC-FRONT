import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { switchMap } from 'rxjs';
import { Clase } from 'src/app/_model/clase';
import { ClaseService } from 'src/app/_service/clase.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manto-clases',
  templateUrl: './manto-clases.component.html',
  styleUrls: ['./manto-clases.component.css']
})
export class MantoClasesComponent implements OnInit {

  clase: Clase;
  titulo : String = 'NUEVA CLASE';
  form : FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: Clase,
    private matDialog: MatDialogRef<MantoClasesComponent>,
    private claseService: ClaseService
  ) { }

  ngOnInit(): void {
    this.clase = {...this.data};
    this.initForm();
  }

  close(){
    this.matDialog.close();
  }

  initForm(){
    if (this.clase.codigo == ''){
      this.form = new FormGroup({
        'codigo': new FormControl('', [Validators.required, Validators.maxLength(4), Validators.minLength(4)]),
        'nombre': new FormControl('', [Validators.required]),
        'acronimo': new FormControl('', [Validators.required]),
      })
    }else {
      this.titulo = 'ACTUALIZAR CLASE';
      this.form = new FormGroup({
        'codigo': new FormControl(this.clase.codigo, [Validators.required,  Validators.maxLength(4), Validators.minLength(4)]),
        'nombre': new FormControl(this.clase.nombre, [Validators.required,  Validators.minLength(5)]),
        'acronimo': new FormControl(this.clase.acronimo, [Validators.required,  Validators.minLength(5)]),
      })
    }
  }

  operate(){
    if (this.form.valid){
      if (this.clase.codigo != null && this.clase.codigo != ''){
        debugger;
        this.clase.codigo = this.form.value['codigo'];
        this.clase.nombre = this.form.value['nombre'];
        this.clase.acronimo = this.form.value['acronimo'];
        this.claseService.modificar(this.clase).pipe(
          switchMap((response: any) => {
            debugger;
            return this.claseService.listar();
          })
        ).subscribe(
          {
            next : (respuestaLista:any) => {
              debugger;
              this.claseService.setClaseCambio(respuestaLista.data)
              Swal.fire('Clase actualizada',
                `Clase '${this.clase.codigo}', fue actualizado con éxito!`,
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
        this.clase = new Clase();
        this.clase.codigo = this.form.value['codigo'];
        this.clase.nombre = this.form.value['nombre'];
        this.clase.acronimo = this.form.value['acronimo'];
        this.claseService.registrar(this.clase).pipe(
          switchMap((response: any) => {
            debugger;
            return this.claseService.listar();
          })
        ).subscribe(
          {
            next : (respuestaLista:any) => {
              debugger;
              this.claseService.setClaseCambio(respuestaLista.data)
              Swal.fire('Se registro clase correctamente',
                `Clase '${this.clase.codigo}', registrado!`,
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
