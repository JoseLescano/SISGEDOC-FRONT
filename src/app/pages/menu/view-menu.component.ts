import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Menu } from 'src/app/_model/menu';
import { MenuService } from 'src/app/_service/menu.service';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { switchMap } from 'rxjs';
import { MantoMenuComponent } from './manto-menu/manto-menu.component';
@Component({
  selector: 'app-view-menu',
  templateUrl: './view-menu.component.html',
  styleUrls: ['./view-menu.component.css']
})
export class ViewMenuComponent implements OnInit {

   displayedColumns: string[] = ['Codigo', 'Nombre', 'URL' ,'Acciones'];
    dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
    cargando: boolean= false;
  
    @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

  
  constructor(
    private menuServices: MenuService,
    public dialog: MatDialog
  ) { }


  ngOnInit(): void {
    this.menuServices.getMenuChange().subscribe((response: any )=> {
      this.createTable(response)
    });

    this.menuServices.listar().subscribe((response: any) => {
    this.createTable(response)
    });
  }

  cargarMenu(){
    this.menuServices.listar().subscribe(
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


openDialog(menu?: Menu){
    this.dialog.open(MantoMenuComponent, {
      width: '50%',
      data: menu,
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
        this.menuServices.eliminar(codigo)
        .pipe(
          switchMap((response: any)=>
            {
              debugger;
              return this.menuServices.listar();
            }
          )
        )
        .subscribe(
          {
            next : (respuestaLista: any)=> {
              debugger
              this.menuServices.setMenuChange(respuestaLista);
              Swal.fire(
                'Borrado!',
                'Menu ha sido eliminado.',
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

