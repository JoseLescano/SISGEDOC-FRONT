import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CorrecionService } from 'src/app/_service/correcion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registrar-correcion',
  templateUrl: './registrar-correcion.component.html',
  styleUrls: ['./registrar-correcion.component.css']
})
export class RegistrarCorrecionComponent implements OnInit {

  url_pdf: any;
  vidDocumento:any;
  codigoDecreto: any;
  observaciones : any = '';
  errorPDF : boolean = false;
  cargando: boolean = false;
  form:FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data:any,
    private correcionService: CorrecionService,
    private matDialog: MatDialogRef<RegistrarCorrecionComponent>,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(){
    this.cargando = true;
    this.getIdDocumento();
    this.form = new FormGroup({
      'codigoDocumento': new FormControl(this.vidDocumento, [Validators.required]),
      'idDecreto': new FormControl(this.codigoDecreto, [Validators.required]),
      'observacion': new FormControl('', [Validators.required, Validators.minLength(10)])
    });
    this.cargando = false;
  }

  getIdDocumento(): void {
    this.codigoDecreto = this.data.decreto;
    this.vidDocumento = this.data.documento;
  }

  operate(){
    if(this.form.valid){
      this.cargando = true;
      let observacion = this.form.controls['observacion'].value;
      this.correcionService.registrarCorrecion(this.vidDocumento, this.codigoDecreto, observacion)
      .subscribe((response:any)=> {
        this.close();
        Swal.fire('ACCION REALIZADA', response.message, 'success');
        this.router.navigate(["/principal/parte-diario"]);
        this.cargando = false;
      }, error=> {
        this.cargando = false;
        Swal.fire('LO SENTIMOS', 'SE PRESENTO UN INCONVENIENTE', 'info');
      });
    }
  }

  close(){
    this.matDialog.close();
  }

  

}
