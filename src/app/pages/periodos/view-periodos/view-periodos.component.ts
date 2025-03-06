import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Periodo } from 'src/app/_model/periodo';
import { PeriodoService } from 'src/app/_service/periodo.service';
import { MantoPeriodosComponent } from '../manto-periodos/manto-periodos.component';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { switchMap } from 'rxjs';
@Component({
  selector: 'app-view-periodos',
  templateUrl: './view-periodos.component.html',
  styleUrls: ['./view-periodos.component.css']
})
export class ViewPeriodosComponent implements OnInit {

  displayedColumns: string[] = ['Codigo', 'Descripcion', 'Cabecera','Acciones'];
      dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
      cargando: boolean= false;

      @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
      @ViewChild(MatSort) sort!: MatSort;


  constructor(
     private periodoServices: PeriodoService,
     public dialog: MatDialog

  ) { }


  ngOnInit(): void {
  this.periodoServices.getPeriodoCambio().subscribe((response: any )=> {
      this.createTable(response)
    });

    this.periodoServices.listar().subscribe((response: any) => {
      debugger
    this.createTable(response)
    });
  }
    
    cargarPeriodo(){
      this.periodoServices.listar().subscribe(
        {
          next:(response:any)=>{
            debugger;
            this.createTable(response);
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


  openDialog(periodo?: Periodo){
    this.dialog.open(MantoPeriodosComponent, {
      width: '50%',
      data: periodo,
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
        this.periodoServices.eliminar(codigo)
        .pipe(
          switchMap((response: any)=>
            {
              debugger;
              return this.periodoServices.listar();
            }
          )
        )
        .subscribe(
          {
            next : (respuestaLista: any)=> {
              debugger
              this.periodoServices.setPeriodoCambio(respuestaLista.data);
              Swal.fire(
                'Borrado!',
                'Periodo ha sido eliminado.',
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
