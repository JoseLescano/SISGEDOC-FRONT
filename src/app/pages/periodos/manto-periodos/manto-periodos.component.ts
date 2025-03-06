import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { switchMap } from 'rxjs';
import { Periodo } from 'src/app/_model/periodo';
import { PeriodoService } from 'src/app/_service/periodo.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manto-periodos',
  templateUrl: './manto-periodos.component.html',
  styleUrls: ['./manto-periodos.component.css']
})
export class MantoPeriodosComponent implements OnInit {

  periodo: Periodo = new Periodo();
  titulo : String = 'NUEVO PERIODO';
  form : FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: Periodo,
    private matDialog: MatDialogRef<MantoPeriodosComponent>,
    private periodoService: PeriodoService
  ) { }

   ngOnInit(): void {
    this.periodo = {...this.data};
    this.initForm();
  }

  close(){
    this.matDialog.close();
  }

  initForm(){
    if (this.periodo.codigo == ''){
      this.form = new FormGroup({
        'codigo': new FormControl('', [Validators.required, Validators.maxLength(4), Validators.minLength(4)]),
        'definicion': new FormControl('', [Validators.required]),
        'cabecera': new FormControl('', [Validators.required, Validators.minLength(4)]),
      })
    }else {
      this.titulo = 'ACTUALIZAR PERIODO';
      this.form = new FormGroup({
        'codigo': new FormControl(this.periodo.codigo, [Validators.required,  Validators.maxLength(4), Validators.minLength(4)]),
        'definicion': new FormControl(this.periodo.definicion, [Validators.required,  Validators.minLength(1)]),
        'cabecera': new FormControl(this.periodo.cabecera, [Validators.required,  Validators.minLength(4)]),
      })
    }
  }

  operate(){
    if (this.form.valid){
      if (this.periodo.codigo != null && this.periodo.codigo != ''){
        debugger;
        this.periodo.codigo = this.form.value['codigo'];
        this.periodo.definicion = this.form.value['definicion'];
        this.periodo.cabecera = this.form.value['cabecera'];
        this.periodoService.modificar(this.periodo).pipe(
          switchMap((response: any) => {
            debugger;
            return this.periodoService.listar();
          })
        ).subscribe(
          {
            next : (respuestaLista:any) => {
              debugger;
              this.periodoService.setPeriodoCambio(respuestaLista.data)
              Swal.fire('Periodo actualizado',
                `Periodo '${this.periodo.codigo}', fue actualizado con éxito!`,
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
        this.periodo.codigo = this.form.value['codigo'];
        this.periodo.definicion = this.form.value['definicion'];
        this.periodo.cabecera = this.form.value['cabecera'];
        this.periodoService.registrar(this.periodo).pipe(
          switchMap((response: any) => {
            debugger;
            return this.periodoService.listar();
          })
        ).subscribe(
          {
            next : (respuestaLista:any) => {
              debugger;
              this.periodoService.setPeriodoCambio(respuestaLista.data)
              Swal.fire('Se registro periodo correctamente',
                `Periodo '${this.periodo.codigo}', registrado!`,
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
