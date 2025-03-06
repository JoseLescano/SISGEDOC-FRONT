import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { switchMap } from 'rxjs';
import { Menu } from 'src/app/_model/menu';
import { MenuService } from 'src/app/_service/menu.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manto-menu',
  templateUrl: './manto-menu.component.html',
  styleUrls: ['./manto-menu.component.css']
})
export class MantoMenuComponent implements OnInit {

  menu: Menu = new Menu();
  titulo : String = 'NUEVA MENU';
  form : FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private matDialog: MatDialogRef<MantoMenuComponent>,
    private menuService: MenuService
  ) { 
  }

  ngOnInit(): void {
    debugger
      this.menu = {...this.data};
    debugger
    this.initForm();
  }

  close(){
    this.matDialog.close();
  }

  initForm(){
    debugger
    if (this.menu.codigo == ''|| this.menu.codigo=='undefined'){
      debugger
      this.form = new FormGroup({
        'codigo': new FormControl('', [Validators.required, Validators.maxLength(3), Validators.minLength(3)]),
        'nombre': new FormControl('', [Validators.required]),
        'url': new FormControl('', [Validators.required]),
      })
    }else {
      this.titulo = 'ACTUALIZAR MENU';
      this.form = new FormGroup({
        'codigo': new FormControl(this.menu.codigo, [Validators.required,  Validators.maxLength(3), Validators.minLength(3)]),
        'nombre': new FormControl(this.menu.nombre, [Validators.required,  Validators.minLength(5)]),
        'url': new FormControl(this.menu.url, [Validators.required]),
      })
    }
  }

  operate(){
    if (this.form.valid){
      if (this.menu.codigo != null && this.menu.codigo != ''){
        debugger;
        this.menu.codigo = this.form.value['codigo'];
        this.menu.nombre = this.form.value['nombre'];
        this.menu.url = this.form.value['url'];
        this.menuService.modificar(this.menu).pipe(
          switchMap((response: any) => {
            debugger;
            return this.menuService.listar();
          })
        ).subscribe(
          {
            next : (respuestaLista:any) => {
              debugger;
              this.menuService.setMenuChange(respuestaLista)
              Swal.fire('Menu actualizado',
                `Menu '${this.menu.codigo}', fue actualizado con éxito!`,
                'success');
              this.close();
            },
            error: (err: any)=> {
              debugger
              console.log(err);

            }
          }
        )
      } else {
        debugger;
        this.menu = new Menu();
        this.menu.codigo = this.form.value['codigo'];
        this.menu.nombre = this.form.value['nombre'];
        this.menu.url = this.form.value['url'];
        this.menu.nivel = 1;
        this.menu.agrupa = 1;
        this.menu.icon = null;
        this.menuService.registrar(this.menu).pipe(
          switchMap((response: any) => {
            debugger;
            return this.menuService.listar();
          })
        ).subscribe(
          {
            next : (respuestaLista:any) => {
              debugger;
              this.menuService.setMenuChange(respuestaLista)
              Swal.fire('Se registro menu correctamente',
                `Menu '${this.menu.codigo}', registrado!`,
                'success');
              this.close();
            },
            error: (err: any)=> {
              debugger
              console.log(err);

            }
          }
        )
      }
    } else {

    }
  }

}
