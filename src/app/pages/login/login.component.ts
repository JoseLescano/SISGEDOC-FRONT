import { JwtHelperService } from '@auth0/angular-jwt';
import swal from 'sweetalert2'
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Perfil } from 'src/app/_model/perfil';
import { environment } from 'src/environments/environment';
import { LoginService, ILoginRequest } from 'src/app/_service/login.service';
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
  recaptchaToken: string = '';

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

login() {
  debugger;
  if (this._formulario.invalid) {
    this.buttonClicked = true;
    if (this._formulario.get("username").invalid) this.username_aux = true;
    if (this._formulario.get("password").invalid) this.password_aux = true;
    if (this._formulario.get("token").invalid) this.token_aux = true;
    return;
  }

  const jwtRequest: ILoginRequest = {
    username: this.username,
    password: this.password,
    token: this.recaptchaToken
  };

  this.loginService.login(jwtRequest).subscribe({
    next: (response) => {
    /*  sessionStorage.setItem(environment.TOKEN_NAME, response.access_token);
      this.router.navigate(['pages/dashboard']);*/
     // console.log(response);
    this.openModalMfaStatus0(this.username, response);
    },
  });
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

resetForm() {

  this.recaptchaToken = '';
  this.captchaResolved = false;
  this.username = '';
  this.password = '';
}

onCaptchaResolved(token: string) {
  this.recaptchaToken = token;
  this.captchaResolved = true;
  this._formulario.get('token').setValue(token);
}

convertirAMayusculas() {
  if (this.username) {
    this.username = this.username.toUpperCase();
  }
}



}
