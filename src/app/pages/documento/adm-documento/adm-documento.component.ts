import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Documento } from 'src/app/_model/documento.model';
import { DocumentoService } from 'src/app/_service/documento.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PersonaService } from 'src/app/_service/persona.service';
import { Persona } from 'src/app/_model/persona';
import { HttpErrorResponse } from '@angular/common/http';
import { OrganizacionService } from 'src/app/_service/organizacion.service';

@Component({
  selector: 'app-adm-documento',
  templateUrl: './adm-documento.component.html',
  styleUrls: ['./adm-documento.component.css']
})
export class AdmDocumentoComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['Nro',  'Asunto', 'Documento', 'Origen', 'Destino', 'FechaDoc.'];

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  campoIngresado: any;
  organizacionArchivar: any;
  formArchivar : FormGroup;

  persona: Persona = new Persona();
  nombreCompleado: string;
  CIPIngresado: any;
  observacionArchivado: any = '';

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  cargandoArchivado: boolean = false;

  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });


  constructor(private documentoService: DocumentoService,
    public dialog: MatDialog,
    private personaService: PersonaService,
    private organizacionService: OrganizacionService
  ) { }


  ngOnInit(): void {
    this.initForm();
  }

  initForm(){
    this.formArchivar = new FormGroup({
      'codigoUnidad': new FormControl('', [Validators.required]),
      'listaDecretos': new FormControl('', [Validators.required]),
      'cipSolicitante': new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(9)]),
      'usuario': new FormControl('', [Validators.required]),
      'observacion': new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]),
    })

  }


  getOrganizacion(){
    this.cargandoArchivado = true;
    this.campoIngresado = this.formArchivar.value['codigoUnidad'];
    this.organizacionService.findByCodigoInterno(this.campoIngresado)
    .subscribe(
      {
        next: (response: any)=> {
          this.cargandoArchivado = false;
          this.organizacionArchivar = response.data.nombreLargo;
        },
        error: (err: any)=> {
          this.cargandoArchivado = false;
          this.organizacionArchivar = null;
          Swal.fire('ORGANIZACION NO ENCONTRADA', 'ORGANIZACION NO EXISTE EN LA BD!', 'info')
        }
      }
    );
  }

  buscarPersona(){
    this.CIPIngresado = this.formArchivar.value['cipSolicitante'];
    this.personaService.findByCampo(this.CIPIngresado).subscribe(
      {
        next: (data:any)=> {
          if (data!= null){
            this.cargandoArchivado = true;
            this.persona = data;
           this.nombreCompleado = this.persona.grado_LARGA + ' '+ this.persona.arma_LARGA + ' '+  this.persona.apellidos+  ' ' + this.persona.nombres;
           this.formArchivar.get('usuario').setValue(this.persona.usuario_CHASQUI);
            this.cargandoArchivado=false;
          }else {
            this.persona = null;
            this.nombreCompleado = '';

            this.cargandoArchivado=false;
            Swal.fire('SIN RESULTADOS', `NO SE ENCONTRO DATOS CON EL CIP INGRESADOx`, 'info');
          }
        },
        error: (error: any| HttpErrorResponse)=> {
          this.nombreCompleado = '';
          this.persona.correo_CHASQUI = '';
          this.dataSource = null;
          this.cargandoArchivado=false;
          Swal.fire('LO SENTIMOS', `NO SE ENCONTRO DATOS CON EL CIP INGRESADO`, 'info');
        }

      })
  }


  cargarDocumentos() {
    if (this.range.value['start']!= null && this.range.value['end']!=null){
      this.cargandoArchivado = true;
      this.formArchivar.get('listaDecretos').setValue('');
      this.documentoService.findByOrganizacionDestinoForSuperAdm(
        this.campoIngresado,
        environment.convertDateToStr(this.range.value['start']),
        environment.convertDateToStr(this.range.value['end'])
      ).subscribe(
        (data: Documento[]) => {
          this.createTable(data);
          this.formArchivar.get('listaDecretos').setValue(this.dataSource.data.map(registro => `${registro.codigoDecreto}`).join(','));
          this.cargandoArchivado = false;
        },
        (err) => {
          this.cargandoArchivado = false;
          Swal.fire('Error', 'No se pudieron cargar los documentos', 'error');
        }
      );
    } else {
      Swal.fire('AVISO', 'DEBE DE INGRESAR RANGO DE FECHAS PARA LA BUSQUEDA', 'info');
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  findParaParte(){
    this.formArchivar.get('listaDecretos').setValue('');
    this.documentoService.findParaParteBySuperADM(this.campoIngresado,
      environment.convertDateToStr(this.range.value['start']),
      environment.convertDateToStr(this.range.value['end'])
    )
    .subscribe(
      {
        next : (response: any)=> {
          this.createTable(response);
          this.formArchivar.get('listaDecretos').setValue(this.dataSource.data.map(registro => `${registro.codigoDecreto}`).join(','));
        },
        error: (err: any) => {
          Swal.fire('Error', err.message, 'error');
        }
      }
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  createTable(documento: Documento[]) {
    this.dataSource.data = documento;
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  guardarAchivoForSuperADM(){
    this.cargandoArchivado = true;
    if (this.formArchivar.valid){
      let idsFormateados =  this.formArchivar.get('listaDecretos').value;
      let fi =  environment.convertDateToStr(this.range.value['start']);
      let ff = environment.convertDateToStr(this.range.value['end']);

      let observacion = this.formArchivar.get('observacion').value;
      this.cargandoArchivado = true;
      let usuario = this.persona.usuario_CHASQUI;
      this.documentoService.archivarDocumentoForSuperAdm(
        this.campoIngresado, observacion, fi, ff, usuario)
        .subscribe(
        {
          next : (response:any) => {
            this.cargandoArchivado = false;
            this.dataSource.data = null;
            Swal.fire('ACCION REALIZADA', response.message, 'success');
          }, error: (err: any)=> {
            Swal.fire('OPERACION NO REALIZADA', err, 'info');
            this.cargandoArchivado = false;
          }
        }
      );
    } else {
      this.cargandoArchivado = false;
      Swal.fire('AVISO', 'INGRESE LOS CAMPOS SOLICITADOS PARA REALIZAR LA SOLICITUD', 'info')
    }

  }

  validarNumero(event: KeyboardEvent) {
    const inputChar = String.fromCharCode(event.charCode);
    if (!/^\d+$/.test(inputChar)) {
      event.preventDefault();
    }
  }



}
