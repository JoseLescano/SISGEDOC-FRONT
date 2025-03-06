import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Rol } from 'src/app/_model/rol';
import { RoleService } from 'src/app/_service/role.service';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { switchMap } from 'rxjs';
import { MantoRolComponent } from '../manto-roles/manto-roles.component';


@Component({
  selector: 'app-view-roles',
  templateUrl: './view-roles.component.html',
  styleUrls: ['./view-roles.component.css']
})
export class ViewRolesComponent implements OnInit {

  displayedColumns: string[] = ['Codigo', 'Nombre','Acciones'];
      dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
      cargando: boolean= false;

      @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
      @ViewChild(MatSort) sort!: MatSort;


  constructor(
    private roleServices: RoleService,
    public dialog: MatDialog
  ) { }


  ngOnInit(): void {
    this.roleServices.getRoleChange().subscribe((response: any )=> {
      this.createTable(response)
    });

    this.roleServices.listar().subscribe((response: any) => {
    this.createTable(response)
    });
  }

  cargaRole(){
    this.roleServices.listar().subscribe(
      {
        next:(response:any)=>{
          debugger;
          this.createTable(response);
        },
        error:(er:any)=>{
          console.log(er)
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


openDialog(rol?: Rol){
    this.dialog.open(MantoRolComponent, {
      width: '50%',
      data: rol,
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
        this.roleServices.eliminar(codigo)
        .pipe(
          switchMap((response: any)=>
            {
              debugger;
              return this.roleServices.listar();
            }
          )
        )
        .subscribe(
          {
            next : (respuestaLista: any)=> {
              debugger
              this.roleServices.setRoleChange(respuestaLista);
              Swal.fire(
                'Borrado!',
                'Rol ha sido eliminado.',
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


