import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Clase } from 'src/app/_model/clase';
import { ClaseService } from 'src/app/_service/clase.service';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { switchMap } from 'rxjs';
import { MantoClasesComponent } from './manto-clases/manto-clases.component';
@Component({
  selector: 'app-view-clases',
  templateUrl: './view-clases.component.html',
  styleUrls: ['./view-clases.component.css']
})
export class ViewClasesComponent implements OnInit {

  displayedColumns: string[] = ['Codigo', 'Nombre', 'Acronimo' ,'Acciones'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  cargando: boolean= false;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  constructor(
    private claseServices: ClaseService,
    public dialog: MatDialog
  ) { }


  ngOnInit(): void {
    this.claseServices.getClaseCambio().subscribe((response: any )=> {
      this.createTable(response)
    });

    this.claseServices.listar().subscribe((response: any) => {
    this.createTable(response.data)
    });
  }

  cargarClase(){
    this.claseServices.listar().subscribe(
      {
        next:(response:any)=>{
          debugger;
          this.createTable(response.data);
        },
        error:(er:any)=>{

        }
      }
    );
  }
  createTable(documentos: any[]): void {
    this.dataSource = new MatTableDataSource(documentos);
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;


    });

}
applyFilter(event: Event) {
  const filterValue = (event.target as HTMLInputElement).value;
  this.dataSource.filter = filterValue.trim().toLowerCase();

}


openDialog(clase?: Clase){
    this.dialog.open(MantoClasesComponent, {
      width: '50%',
      data: clase,
    });
  }

  eliminar(codigo: any){
    Swal.fire({
      title: '¿Está seguro?',
      text: "No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, bórralo.'
    }).then((result) => {
      if (result.isConfirmed) {
        this.claseServices.eliminar(codigo)
        .pipe(
          switchMap((response: any)=>
            {
              debugger;
              return this.claseServices.listar();
            }
          )
        )
        .subscribe(
          {
            next : (respuestaLista: any)=> {
              debugger
              this.claseServices.setClaseCambio(respuestaLista.data);
              Swal.fire(
                'Borrado!',
                'Clase ha sido eliminado.',
                'success'
              );
            },
            error: (err: any)=> {
              debugger
              console.log(err)
              Swal.fire(
                'LO SENTIMOS',
                err,
                'warning'
              )
            }
          }
        );
      }
    })
  }

}
