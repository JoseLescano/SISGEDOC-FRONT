import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PersonaExterno } from 'src/app/_model/personaExterno';
import { PersonalExternoService } from 'src/app/_service/personal-externo.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-persona-externa',
  templateUrl: './persona-externa.component.html',
  styleUrls: ['./persona-externa.component.css']
})
export class PersonaExternaComponent implements OnInit {

  displayedColumns: string[] = ['Codigo', 'Nombres', 'Apellidos','DNI', 'Email', 'Estado',  'Acciones'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  cargando: boolean= false;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  myForm !: FormGroup;
  personas : any= [];

  constructor(private personalService: PersonalExternoService, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.getPersonalExterno();
    this.initForm();

  }

  createTable(lista: any[]): void {
    this.dataSource = new MatTableDataSource(lista);
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      this.dataSource.sortingDataAccessor = (item, property) => {
        switch(property) {
          case 'Codigo': return item.codigo;
          case 'Nombres': return item.nombres.toLowerCase();
          case 'Apellidos': return item.apellidos;
          case 'DNI': return item.dni;
          case 'email': return item.email;
          // Añade más casos según tus columnas
          default: return item[property];
        }
      };
    });

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

  }

  ngAfterViewInit() {
    this.dataSource = null;
    if (this.dataSource!= null){
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  initForm(){
    this.myForm = new FormGroup({
      codigo: new FormControl(0),
      nombres: new FormControl('', [Validators.required,  Validators.minLength(3)]),
      apellidos: new FormControl('', [Validators.required,  Validators.minLength(10)]),
      dni:new FormControl('', [Validators.required ]),
      email: new FormControl('', [Validators.email])
    });
  }

  getPersonalExterno(){
    this.cargando = true;
    this.initForm();

    this.personalService.getPersonalExterno().subscribe({
      next: (response:PersonaExterno[]) => {
        this.createTable(response);
        this.cargando = false;
      }, error : (err) => {
        this.cargando = false;
        Swal.fire('LO SENTIMOS', err, "warning");
      }
    });
  }

  operate(){
    //debugger;
    if (this.myForm.valid){

      if (this.myForm.get('codigo')?.value > 0){
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
        'INGRESE LA INFORMACION SOLICITADA',
        'warning'
      );
    }


  }

  editar(persona: any){
    this.myForm = new FormGroup({
      'codigo': new FormControl(persona.codigo),
      'nombres': new FormControl(persona.nombres, [Validators.required,  Validators.minLength(3)]),
      'apellidos': new FormControl(persona.apellidos, [Validators.required,  Validators.minLength(10)]),
      'dni':new FormControl(persona.dni, [Validators.required ]),
      'email': new FormControl(persona.email, [Validators.email])
    });
  }

  cambiarEstado(codigo: any){
    this.personalService.cambiarEstadoPersonal(codigo).subscribe((data: any) => {
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
