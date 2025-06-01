import { ClaseService } from './../../../_service/clase.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Organizacion } from 'src/app/_model/organizacion';
import { FacilitaService } from 'src/app/_service/facilita.service';
import { OrganizacionService } from 'src/app/_service/organizacion.service';
import { PrioridadService } from 'src/app/_service/prioridad.service';
import Swal from 'sweetalert2';

export interface Archivo {
  id: number;
  url : string;
  name: string;

}

@Component({
  selector: 'app-enviar-documento-facilita',
  templateUrl: './enviar-documento-facilita.component.html',
  styleUrls: ['./enviar-documento-facilita.component.css']
})
export class EnviarDocumentoFacilitaComponent implements OnInit {

  columnas: string[] = ['nombre',  'ver', 'principal'];
  archivos:any[] = [];
  documentoId:any=0;
  form:FormGroup;
  destinos:any[]=[];
  prioridades:any[]=[];
  tipoDocumentos: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private facilitaService:FacilitaService,
    private fb: FormBuilder,
    private organizacionService:OrganizacionService,
    private prioridadService: PrioridadService,
    private claseService:ClaseService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      documentoId: [null, Validators.required],
      archivoId: [null, Validators.required],
      prioridad: ['', Validators.required],  // o como manejes tus prioridades
      tipoDocumento: ['', Validators.required],
      destino: [[], Validators.required],
      copiasInformativas: [[]]
    });
    this.getIdDocumento();
    this.getPrioridades();
    this.getTipoDocumentos();
  }

  getIdDocumento(): void {
    const id = +this.route.snapshot.paramMap.get('codigoDocumento');
    this.documentoId = id;
    this.form.get('documentoId').setValue(this.documentoId);
    this.getArchivos(this.documentoId);
  }

  getPrioridades(){
    this.prioridadService.listar()
    .subscribe(
      {
        next: (response:any)=> {
          this.prioridades = response;
        }, error:(err:any)=> {
          console.log(err)
        }
      }
    );
  }
  getTipoDocumentos(){
    this.claseService.listar()
    .subscribe(
      {
        next: (response:any)=> {
          this.tipoDocumentos = response.data;
        }, error:(err:any)=> {
          console.log(err)
        }
      }
    );
  }

  verArchivo(url: string) {
    window.open(url, '_blank');
  }

  enviarFormulario() {
    if (this.form.valid) {
      console.log(this.form.value);
      // Aquí puedes llamar al servicio para enviar los datos
    } else {
      this.form.markAllAsTouched();
    }
  }

  seleccionarPrincipal(archivo: any) {
    this.form.get('archivoId')?.setValue(archivo.id);
  }

  getArchivos(documentoId: any): void {
    debugger
    this.documentoId = documentoId;
    // Limpia explícitamente el FormArray (vacía los elementos)
    this.facilitaService.getArchivos(documentoId).subscribe(
      {
        next: (response:any)=> {
          this.archivos = response;

          // Autoasignar si hay solo uno
          if (this.archivos.length === 1) {
            this.form.patchValue({
              archivoId: this.archivos[0].id
            });
    }

           this.organizacionService.getRemitentesInterno().subscribe((response:any)=>{
             this.destinos = response.data as Organizacion[];
           });

          // this.prioridadService.listar().subscribe((response: any)=> this.prioridades = response);
        },
        error: (err: any)=> {
          Swal.fire('AVISO', 'SE PRESENTO UN INCONVENIENTE', 'info');
        }
      }
    );
  }
}
