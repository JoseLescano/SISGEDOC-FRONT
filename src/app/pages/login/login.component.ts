import { ReCaptchaV3Service } from 'ng-recaptcha';
import { JwtHelperService } from '@auth0/angular-jwt';
import swal from 'sweetalert2'
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LoginService, ILoginRequest } from 'src/app/_service/login.service';
import Swal from 'sweetalert2';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalMfaComponent } from './modal-mfa/modal-mfa.component';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent{

  error: string;
 message: string;
  _formulario: FormGroup;
  username: string;
  fullname: string;
  password: string;
  loading: boolean = false;

  captchaResolved: boolean = false;
  username_aux: boolean = false;
  password_aux: boolean = false;

  recaptchaToken: string = '';

  constructor(
    private recaptchaV3Service: ReCaptchaV3Service,
    public dialog: MatDialog,
    private loginService: LoginService,
  ) {
    this._formulario = new FormGroup({
      username: new FormControl("", Validators.required),
      password: new FormControl("", Validators.required),
    });
  }

  login() {
     if (this._formulario.invalid) {
       if (this._formulario.get("username").invalid) this.username_aux = true;
       if (this._formulario.get("password").invalid) this.password_aux = true;
       Swal.fire('LO SENTIMOS', 'INGRESE USUARIO Y/O CONTRASEÑA PARA PODER INGRESAR', 'info');
       return;
     }
     this.executeReCaptcha('login_action');
  }

  executeReCaptcha(action: string): void {

    this.recaptchaV3Service.execute(action).subscribe({
      next: (token) => {
        this.recaptchaToken = token;
        this.performLogin();
      },
      error: (err) => {

        console.error('ReCAPTCHA v3 error:', err);
        this.error = 'reCAPTCHA failed';
      }
    });
  }

  performLogin(): void {

    const jwtRequest = {
      username: this.username,
      password: this.password,
      token: this.recaptchaToken
    };
    this.loginService.login(jwtRequest).subscribe( {
      next : (response)=> {
        this.openModalMfaStatus0(this.username, response);
      },  error : (err:any) => {
        Swal.fire('AVISO', err.message, 'info');
      }
    });
  }

  openModalMfaStatus0(username: string, response: any): void {

    const dialogRef = this.dialog.open(ModalMfaComponent, {
      data: { username: username, response: response }
    });
    dialogRef.componentInstance.cerrarDialogo.subscribe(() => {
      dialogRef.close();
    });
  }


  resetForm() {
    this.recaptchaToken = '';
    this.captchaResolved = false;
    this.username = '';
    this.password = '';
  }

  convertirAMayusculas() {
    if (this.username) {
      this.username = this.username.toUpperCase();
    }
  }
}
