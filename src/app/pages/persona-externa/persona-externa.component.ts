import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { PersonalExternoService } from 'src/app/_service/personal-externo.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-persona-externa',
  templateUrl: './persona-externa.component.html',
  styleUrls: ['./persona-externa.component.css']
})
export class PersonaExternaComponent implements OnInit {

  myForm !: FormGroup;
  personas : any= [];

  constructor(private personalService: PersonalExternoService, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.getPersonalExterno();
    this.initForm();

  }

  initForm(){
    this.myForm = new FormGroup({
      idPersonal: new FormControl(0),
      nombres: new FormControl('', [Validators.required,  Validators.minLength(3)]),
      apellidos: new FormControl('', [Validators.required,  Validators.minLength(10)]),
      nroDocumento:new FormControl('', [Validators.required ]),
      email: new FormControl('', [Validators.email])
    });
  }

  getPersonalExterno(){
    this.initForm();
    this.personalService.getPersonalExterno().subscribe(data => this.personas = data);
  }

  operate(){
    //debugger;
    if (this.myForm.valid){

      if (this.myForm.get('idPersonal')?.value > 0){
        this.personalService.actualizarPersonal(this.myForm.value).subscribe((data: any) => {
          if (data.mensaje === 'SE ACTUALIZO PERSONAL EXTERNO CORRECTAMENTE'){
            Swal.fire(
              'REGISTRO CORRECTO',
                data.mensaje,
              'info'
            );
            this.initForm();
            this.getPersonalExterno();
          }else {
            Swal.fire(
              'LO SENTIMOS',
                data.mensaje,
              'error'
            );
          }
        });
      } else {

        this.personalService.registrarPersonal(this.myForm.value).subscribe((data:any) => {
          if (data.mensaje === 'SE REGISTRO PERSONAL EXTERNO CORRECTAMENTE'){
            Swal.fire(
              'REGISTRO CORRECTO',
                data.mensaje,
              'info'
            );
            this.initForm();
            this.getPersonalExterno();
          }else {
            Swal.fire(
              'LO SENTIMOS',
                data.mensaje,
              'error'
            );
          }
        });
      }
    } else {
      Swal.fire(
        'LO SENTIMOS',
        'INGRESE LA INFORMACIO SOLICITADA',
        'warning'
      );
    }


  }

  editar(persona: any){
    this.myForm = new FormGroup({
      'idPersonal': new FormControl(persona.vid),
      'nombres': new FormControl(persona.nombres, [Validators.required,  Validators.minLength(3)]),
      'apellidos': new FormControl(persona.apellidos, [Validators.required,  Validators.minLength(10)]),
      'nroDocumento':new FormControl(persona.nroDocumento, [Validators.required ]),
      'email': new FormControl(persona.email, [Validators.email])
    });
  }

  cambiarEstado(vid: any){
    this.personalService.cambiarEstadoPersonal(vid).subscribe((data: any) => {
      Swal.fire(
        'ACCION REALIZADA',
          data.mensaje,
        'info'
      );
      this.initForm();
      this.getPersonalExterno();
    });
  }

}
