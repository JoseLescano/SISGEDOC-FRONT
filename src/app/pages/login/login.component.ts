import { JwtHelperService } from '@auth0/angular-jwt';
import swal from 'sweetalert2'
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Perfil } from 'src/app/_model/perfil';
import { environment } from 'src/environments/environment';
import { LoginService } from 'src/app/_service/login.service';
import Swal from 'sweetalert2';
import { PerfilService } from 'src/app/_service/perfil.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username: string;
  password: string;
  hide : boolean = true;
  perfiles: Perfil[] = [];

  constructor(
    private router: Router,
    private loginService: LoginService,
    private perfilService: PerfilService
  ) { }

  ngOnInit(): void {
  }

  login(){
    this.loginService.login(this.username, this.password).subscribe((response:any)=> {
      sessionStorage.setItem(environment.TOKEN_NAME, response.data);
      if (response.httpStatus=='OK'){
        Swal.fire(response.message, '', 'success');
        this.router.navigate(['/perfiles']);
      }else {
        Swal.fire('LO SENTIMOS', response.message, 'info');
      }
    }, error => {
        swal.fire(
          'Lo sentimos!',
          'El usuario y/o contraseña no coinciden',
          'error'
        )
    });
  }



}
