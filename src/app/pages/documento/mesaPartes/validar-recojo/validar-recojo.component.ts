import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Persona } from 'src/app/_model/persona';
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
  persona: Persona = new Persona();
  nombreCompleado = '';
  dniIngresado: string = '';

  constructor(
    public dialogRef: MatDialogRef<ValidarRecojoComponent>,
    @Inject(MAT_DIALOG_DATA) public dataEnviada: any,
    private personaService:PersonaService,
    private correspondenciaService: CorrespondenciaService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.tipoOperacion = this.dataEnviada.tipoOperacion;
  }

  close(){
    this.dialogRef.close();
  }

  // buscarPersonaExterna(){
  //   this.personaService.findPersonaExternaByDNI(this.dniIngresado).subscribe(
  //     {
  //       next: (data:any)=> {
  //         if (data!= null){
  //           this.cargando = true;
  //           this.persona = data;
  //           this.nombreCompleado =  this.persona.nombres +  ' ' + this.persona.apellidos;
  //           this.cargando=false;
  //         }else {
  //           this.persona = null;
  //           this.nombreCompleado = '';
  //           this.cargando=false;
  //           Swal.fire('SIN RESULTADOS', `NO SE ENCONTRO DATOS CON EL DNI INGRESADO`, 'info');
  //         }
  //       },
  //       error: (error: any| HttpErrorResponse)=> {
  //         this.nombreCompleado = '';
  //         this.persona.correo_CHASQUI = '';
  //         this.cargando=false;
  //         Swal.fire('LO SENTIMOS', `NO SE ENCONTRO DATOS CON EL DNI INGRESADO`, 'info');
  //       }

  //     })
  // }

  validarCredenciales(){
    let correspondencia = this.dataEnviada.data.lista;
    this.cargando = true;
    if ( this.usuario != null &&  this.password != null){
      this.correspondenciaService.entregaCorrespondencia(
        sessionStorage.getItem(environment.codigoOrganizacion),
        this.usuario, this.password,
        correspondencia).subscribe(
          {
            next: (response:any) => {
              debugger
                Swal.fire('VALIDACION CORRECTA', "SE PROCEDERÁ A ENTREGAR LAS CORRESPONDENCIA", 'success');
                const blob = new Blob([response], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'RangVisitaReport.pdf';
                a.click();
                window.URL.revokeObjectURL(url);
                this.cargando = false;
                this.dialogRef.close();
                this.router.navigate(['/principal/recibir-documento']);
              },
              error: (error: any) => {
                this.cargando = false;
                debugger
                Swal.fire('AVISO',  error.message, 'info');
              }
          }
        );

      }
    }

    validarDniAndEntregar(){
      let correspondencia = this.dataEnviada.data.lista;
      this.cargando = true;
      if ( this.dniIngresado != null &&  this.dniIngresado != null){
        this.correspondenciaService.entregaCorrespondencia(
          sessionStorage.getItem(environment.codigoOrganizacion),
          '', '',
          correspondencia, this.dniIngresado).subscribe(
            {
              next: (response: HttpResponse<Blob>) => {
                  Swal.fire('VALIDACION CORRECTA', "SE PROCEDERÁ A ENTREGAR LAS CORRESPONDENCIA", 'success');
                  const blob = new Blob([response.body], { type: 'application/pdf' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'EntregaCorrespondencia.pdf';
                  a.click();
                  window.URL.revokeObjectURL(url);
                  this.cargando = false;
                  this.router.navigate(['/principal/entregarCorrespondencia']).then(() => {
                    // Do something
                    location.reload();
                  });
                },
                error: (error: any) => {
                  this.cargando = false;
                  Swal.fire('LO SENTIMOS',  "SE PRESENTO UN INCONVENIENTE", 'info');
                }
            }
          );
        }
      }

  openPDF(response:any) {
    const byteArray = this.convertListToByteArray(response.body);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    window.open(url);
  }

  private convertListToByteArray(byteArrayList: any[]): Uint8Array {
    const totalLength = byteArrayList.reduce((acc, val) => acc + val.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    byteArrayList.forEach(bytes => {
      result.set(new Uint8Array(bytes), offset);
      offset += bytes.length;
    });
    return result;
  }

}
