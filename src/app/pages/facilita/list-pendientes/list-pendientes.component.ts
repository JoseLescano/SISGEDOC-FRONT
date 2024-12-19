import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatStepper } from '@angular/material/stepper';
import { MatTableDataSource } from '@angular/material/table';
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
  selector: 'app-list-pendientes',
  templateUrl: './list-pendientes.component.html',
  styleUrls: ['./list-pendientes.component.css']
})
export class ListPendientesComponent implements OnInit {

  displayedColumns: string[] = ['Id', 'Asunto',  'Documento', 'Remitente', 'Destino', 'Folio', 'CodigoFacilita', 'Acciones'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

  displayedColumns2: string[] = ['Select','Id', 'Archivo',  'Acciones'];
  dataSource2: MatTableDataSource<Archivo> = new MatTableDataSource<Archivo>();

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('stepper') stepper!: MatStepper; // Referencia al MatStepper

  cargando: boolean;
  destinos :Organizacion[] = [];
  listaFormGroup : FormGroup;
  secondFormGroup : FormGroup;
  urlArchivo: string = '';
  documento: any = '';
  prioridades : any = [];

  constructor(
    private facilitaService: FacilitaService,
    private _formBuilder: FormBuilder,
    private organizacionService: OrganizacionService,
    private prioridadService: PrioridadService
  ) {
      this.listaFormGroup = this._formBuilder.group({
        'idDocumento': new FormControl(null, [Validators.required])}
      );

      this.secondFormGroup = this._formBuilder.group(
        {
          'archivo': this._formBuilder.array([], [Validators.required]),
          'organizacion': new FormControl([], [Validators.required]),
          'prioridad': new FormControl('', [Validators.required])
        }
      );

    }

  ngOnInit(): void {
    this.getDocumentos();
  }

  files: any[]  = [];

  seleccionarDocumento(row: any): void {
    debugger
    this.documento = row;
    // Limpia todos los controles del formulario reactivo
    this.secondFormGroup.reset();

    // Limpia explícitamente el FormArray (vacía los elementos)
    this.archivos.clear();
    this.listaFormGroup.get('idDocumento').setValue(row.id);
    this.facilitaService.getArchivos(row.id).subscribe(
      {
        next: (response:any)=> {
          this.stepper.next();
          this.files = response;

          this.organizacionService.getWithCodigoCopere().subscribe((response:any)=>{
            this.destinos = response.data as Organizacion[];
          });

          this.prioridadService.listar().subscribe((response: any)=> this.prioridades = response);
        },
        error: (err: any)=> {
          Swal.fire('AVISO', 'SE PRESENTO UN INCONVENIENTE', 'info');
        }
      }
    );
  }

  get archivos(): FormArray {
    return this.secondFormGroup.get('archivo') as FormArray;
  }

  getCheckboxControl(index: number): FormControl | null {
    if (this.archivos && this.archivos.length > index) {
      return this.archivos.at(index) as FormControl;
    }
    return null;
  }

  onCheckboxChange(event: any, id: number): void {
    if (event.checked) {
      // Agregar el ID al FormArray si se selecciona
      this.archivos.push(this._formBuilder.control(id));
    } else {
      // Remover el ID del FormArray si se deselecciona
      const index = this.archivos.controls.findIndex(control => control.value === id);
      if (index !== -1) {
        this.archivos.removeAt(index);
      }
    }
  }

  seleccionarArchivo(row: any): void {
    this.secondFormGroup.get('archivo').setValue(row.id);
    this.urlArchivo = row.url;
    window.open(this.urlArchivo, '_blank');

  }

  getDocumentos(){
    this.facilitaService.getDocumentoPendientes()
    .subscribe(
      {
        next: (response: any)=> {
          if (response.length < 0) {
            Swal.fire('SIN RESULTADOS', 'No hay correspondencias disponibles', 'info');
          }else {
            this.createTable(response);
          }
        }, error: (err:any)=> {
          console.log(err);
          Swal.fire('AVISO', 'SE PRESENTO UN INCONVENIENTE', 'info');
        }
      }
    );
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  createTable(documentos: any[]) {
    this.dataSource.data = documentos;
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

}
