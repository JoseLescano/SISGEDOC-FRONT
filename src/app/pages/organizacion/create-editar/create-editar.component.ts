import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { OrganizacionDiagram } from 'src/app/_DTO/OrganizacionDiagram';
import { Organizacion } from 'src/app/_model/organizacion';
import { OrganizacionService } from 'src/app/_service/organizacion.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-editar',
  templateUrl: './create-editar.component.html',
  styleUrls: ['./create-editar.component.css']
})
export class CreateEditarComponent implements OnInit {

  codigoInterno:any = "";
  codigoPadre : String = "";
  organizacionSeleccionada : Organizacion = new Organizacion();
  form : FormGroup;
  titulo : string = "EDITAR ORGANIZACION";
  operacion : string = "GUARDAR";

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private matDialog: MatDialogRef<CreateEditarComponent>,
    private organizacionService:OrganizacionService,
    private router: Router) { }

  ngOnInit(): void {
    if (this.data.editar!=null){
      this.codigoInterno = this.data.editar;
      this.organizacionService.findByCodigoInterno(this.codigoInterno).subscribe((response:any)=> {
        this.organizacionSeleccionada = response.data;
      });
    }else {
      this.codigoPadre = this.data.padre;
      this.titulo = "CREAR ORGANIZACION";
    }
  }

  operate(){
    if (this.data.padre != null ){
      debugger;
      let dto : Organizacion = new Organizacion();
      dto.acronimo = this.organizacionSeleccionada.acronimo;
      dto.nombreLargo = this.organizacionSeleccionada.nombreLargo;
      dto.indicativo = this.organizacionSeleccionada.indicativo;
      dto.cargo = this.organizacionSeleccionada.cargo;
      this.organizacionService.saveOrganizacion(dto, this.codigoPadre).pipe(switchMap(()=>{
        debugger;
          return this.organizacionService.findByCodigoInterno(sessionStorage.getItem(environment.codigoOrganizacion));
      })).subscribe((response:any)=> {
        debugger;
        this.organizacionService.setOrganizacionCambio(response.data);

          Swal.fire('OPERACION REALIZADA', 'SE REGISTRO ORGANIZACION CON EXITO', 'info');
          this.close();
          this.router.navigate(['/principal/organizacion']).then(() => {
            // Do something
            location.reload();
          });

      }, error => {
        Swal.fire('LO SENTIMOS', 'SE PRESENTO UN INCONVENIENTE', 'info');
      });

    }else {
      if(this.organizacionSeleccionada.acronimo!= null && this.organizacionSeleccionada.cargo!=null
        && this.organizacionSeleccionada.indicativo!=null && this.organizacionSeleccionada.nombreLargo!=null){
          this.organizacionService.updateOrganizacion(
            this.codigoInterno, this.organizacionSeleccionada.acronimo,
            this.organizacionSeleccionada.nombreLargo, this.organizacionSeleccionada.indicativo,
            this.organizacionSeleccionada.cargo).pipe(switchMap(()=>{
              return this.organizacionService.findByCodigoInterno(this.codigoInterno);
            })).subscribe((response:any)=> {
              this.organizacionService.setOrganizacionCambio(response.data);
                Swal.fire('OPERACION REALIZADA', 'SE ACTUALIZO ORGANIZACION CON EXITO', 'info');
                this.close();
                this.router.navigate(['/principal/organizacion']).then(() => {
                  // Do something
                  location.reload();
                });

            }, error => {
              Swal.fire('LO SENTIMOS', 'SE PRESENTO UN INCONVENIENTE', 'info');
            });
        }else {
          Swal.fire('LO SENTIMOS', 'DEBE DE INGRESAR LOS CAMPOS REQUERIDOS', 'warning');
        }
    }

  }

  close(){
    this.matDialog.close();
  }
}
