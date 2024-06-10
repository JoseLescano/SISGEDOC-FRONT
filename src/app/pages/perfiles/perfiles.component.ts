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
    debugger;
    // const helper = new JwtHelperService();
    // let token = sessionStorage.getItem(environment.TOKEN_NAME);
    // const decodedToken = helper.decodeToken(token);
    // const username = decodedToken.sub;
    this.getPerfiles();

  }

  getPerfiles(){
    debugger;
    this.perfilService.findByUsuariLogueado().subscribe((response:Perfil[])=> {
      if (response== null){
        Swal.fire("Usuario sin perfiles", "Se valida que el usuario no tiene perfiles asignados", "info");
        this.router.navigate(['/login']);
      }else {
        this.perfiles = response;
        if (this.perfiles?.length<2){
          sessionStorage.setItem(environment.rol, this.perfiles[0].rol.codigo+"" );
          sessionStorage.setItem(environment.codigoOrganizacion, this.perfiles[0].organizacion.codigoInterno);
          sessionStorage.setItem(environment.cargoSeleccionado, this.perfiles[0].nombre);
          sessionStorage.setItem(environment.nombreOrganizacion, this.perfiles[0].organizacion.acronimo);
          this.router.navigate(['/principal/dashboard']);
        }
      }
    },(error: any) => {
      Swal.fire("Lo sentimos", "Se presento un inconveniente", "info");
      this.router.navigate(['/login']);
    });
  }

  seleccionarPerfil(perfil: any){
    //sessionStorage.clear();
    sessionStorage.setItem(environment.rol, perfil.rol.codigo );
    //sessionStorage.setItem(environment.TOKEN_AUTH_USERNAME, perfil.usuario+"");
    sessionStorage.setItem(environment.codigoOrganizacion, perfil.organizacion.codigoInterno);
    // debugger;
    // sessionStorage.setItem(environment.cargoSeleccionado, perfil.nombre);
    // sessionStorage.setItem(environment.nombreOrganizacion, perfil.organizacion.acronimo);
    this.router.navigate(['/principal/dashboard']);
  }

  salir(){
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }


}
