import { JwtHelperService } from '@auth0/angular-jwt';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Route, Router } from '@angular/router';
import { Perfil } from 'src/app/_model/perfil';
import { PerfilService } from 'src/app/_service/perfil.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-perfiles',
  templateUrl: './perfiles.component.html',
  styleUrls: ['./perfiles.component.css']
})
export class PerfilesComponent implements OnInit {

  perfiles: Perfil[]=[];

  constructor(private perfilService: PerfilService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getPerfiles();

  }

  getPerfiles(){
    this.perfilService.findByUsuariLogueado().subscribe(
      {
        next : (response:any)=>{
          this.perfiles = response;
        }, error: (err: any) => {
          console.error('Error al cargar la imagen', err);
      }});
  }

  seleccionarPerfil(perfil: any){
    sessionStorage.setItem(environment.rol, perfil.rol.codigo );
    sessionStorage.setItem(environment.codigoOrganizacion, perfil.organizacion.codigoInterno);
    sessionStorage.setItem(environment.cargoSeleccionado, perfil.nombre + ' - ' + perfil.organizacion.acronimo);

    this.router.navigate(['/principal/dashboard']).then(() => {
      // Do something
     location.reload();
    });
  }

}
