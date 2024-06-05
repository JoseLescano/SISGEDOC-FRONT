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
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalMfaComponent } from './modal-mfa/modal-mfa.component';
import { AngularMaterialModule } from 'src/app/angular-material/angular-material.module';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {

  username: string;
  password: string;
  hide : boolean = true;
  perfiles: Perfil[] = [];

   message: string;
   error: string;
   buttonClicked: boolean = false;
   _formulario: FormGroup;
   fullname: string;
   loading: boolean = false;
   tokencaptcha: string | undefined;
   captchaResolved: boolean = false;
   username_aux: boolean = false;
   password_aux: boolean = false;
   token_aux: boolean = false;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private perfilService: PerfilService,
    public dialog: MatDialog,

  ) {

   }

  ngOnInit(): void {
    this._formulario = new FormGroup({
      username: new FormControl("", Validators.required),
      password: new FormControl("", Validators.required),
      token: new FormControl("", Validators.required),
    });
  }

  // login(){
  //   this.loginService.login(this.username, this.password).subscribe((response:any)=> {
  //     sessionStorage.setItem(environment.TOKEN_NAME, response.data);
  //     if (response.httpStatus=='OK'){
  //       Swal.fire(response.message, '', 'success');
  //       this.router.navigate(['/perfiles']);
  //     }else {
  //       Swal.fire('LO SENTIMOS', response.message, 'info');
  //     }
  //   }, error => {
  //       swal.fire(
  //         'Lo sentimos!',
  //         'El usuario y/o contraseña no coinciden',
  //         'error'
  //       )
  //   });
  // }


login() {
  debugger;
  if (this._formulario.invalid) {
    this.buttonClicked = true;
    if (this._formulario.get("username").invalid) this.username_aux = true;
    if (this._formulario.get("password").invalid) this.password_aux = true;
    if (this._formulario.get("token").invalid) this.token_aux = true;
    return;
  }
  this.loading = true;
  this.buttonClicked = true;
  this.loginService.login(this.username, this.password, this._formulario.get("token").value).subscribe(response => {
    debugger;
    this.openModalMfaStatus0(this.username, response);
    this.loading = false;
    this.buttonClicked = false;
    /*

     if (response==null){
      Swal.fire('xx AL SISTEMA','', 'success');
    }else {
      debugger;
        sessionStorage.setItem(environment.TOKEN_NAME, response.access_token);
        Swal.fire('BIENVENIDO AL SISTEMA','', 'success');
        this.router.navigate(['/perfiles']);


    }

    */
  },)
  setTimeout(() => {
    this.loading = false;
    this.buttonClicked = false;
  }, 3000)
}

openModalMfaStatus0(username: string, response: any): void {
  const dialogRef = this.dialog.open(ModalMfaComponent, {
    data: { username: username, response: response }
  });
  dialogRef.componentInstance.cerrarDialogo.subscribe(() => {
    this._formulario.reset();
    dialogRef.close();
    this.onSwal();
  });
}

onSwal() {
  const helper = new JwtHelperService();
  const token = sessionStorage.getItem(environment.TOKEN_NAME);
  const decodedToken = helper.decodeToken(token);
  this.username = decodedToken.sub;
  // this.loginService.login(this.username).subscribe((response) => {
  //   this.fullname = response.fullname;
  //   Swal.fire('Bienvenido al SICAE', `${this.fullname}`, 'success');
  // });

}

onCaptchaResolved(token: string) {
  this.tokencaptcha = token;
}

convertirAMayusculas() {
  if (this.username) {
    this.username = this.username.toUpperCase();
  }
}




}
