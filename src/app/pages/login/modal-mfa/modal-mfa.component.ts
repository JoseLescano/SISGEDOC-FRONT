import { ChangeDetectorRef, Component, EventEmitter, Inject, OnDestroy, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { AuthenticationResponse } from 'src/app/_model/authentication-response';
import { VerificationRequest } from 'src/app/_model/verification-request';
import { LoginService } from 'src/app/_service/login.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-mfa',
  templateUrl: './modal-mfa.component.html',
  styleUrls: ['./modal-mfa.component.css']
})
export class ModalMfaComponent implements OnInit, OnDestroy {

  @Output() cerrarDialogo = new EventEmitter<void>();
  status: string;
  secretImageUri: any;
  authResponse: string ="";
  otpCode = '';
  showProgressBar: boolean = false;
  intentos: number = 0;
  private dialogCloseTimer: any;
  tiempoRestante: number;
  botonBloqueado: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ModalMfaComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private loginService: LoginService,
    private cd: ChangeDetectorRef,
    private recaptchaV3Service: ReCaptchaV3Service,
  ) { }

  ngOnInit(): void {
    if (this.data.response.status == "0") {
      this.status = "0"
      this.saveTwoFactor();
    }else {
      this.status = "1"
    }

   this.startDialogCloseTimer();

  }

  ngOnDestroy(): void {
    clearTimeout(this.dialogCloseTimer);
  }

  saveTwoFactor(): void {
    if (this.data.response.secretImageUri
      && !this.data.response.secretImageUri.startsWith('data:image/png;base64,')) {
      this.data.response.secretImageUri = 'data:image/png;base64,' + this.data.response.secretImageUri;
    }
    this.authResponse = this.data.response.secretImageUri;
  }

  private startDialogCloseTimer(): void {
    const tiempoTotal = 60;
    this.tiempoRestante = tiempoTotal;
    this.dialogCloseTimer = setInterval(() => {
      if (this.tiempoRestante > 0) {
        this.tiempoRestante--;
        if (this.tiempoRestante === 0) {
          this.cerrarDialogo.emit();
          clearInterval(this.dialogCloseTimer);
        }
      }
    }, 1000);
  }

  validarNumero(event: KeyboardEvent) {
    const inputChar = String.fromCharCode(event.charCode);
    if (!/^\d+$/.test(inputChar)) {
      event.preventDefault();
    }
  }

  validarLongitud() {
    if (this.otpCode && this.otpCode.length > 6) {
      this.otpCode = this.otpCode.slice(0, 6);
    }
  }

  SecretVerify() {

    if (this.otpCode.length !== 6) {
      console.error('Invalid OTP code length');
      return;
    }

    this.cd.detectChanges();
    const verifyRequest: any = {
      cip: this.data.response.cip,
      code: this.otpCode
    };

    this.loginService.verifyCode(verifyRequest).subscribe({
      next: (response) => {
        debugger;
        this.cerrarDialogo.emit();
        if (response && response.access_token) {
          sessionStorage.setItem(environment.TOKEN_NAME, response.access_token);
          let token = sessionStorage.getItem(environment.TOKEN_NAME);
          const helper = new JwtHelperService();
          const decodedToken = helper.decodeToken(token);
          const username = decodedToken.sub;
          const perfil = decodedToken.perfil;
          sessionStorage.setItem(environment.rol, perfil.rol.codigo );
          sessionStorage.setItem(environment.codigoOrganizacion, perfil.organizacion.codigoInterno);
          sessionStorage.setItem(environment.cargoSeleccionado, perfil.nombre + " - " +  perfil.organizacion.acronimo);
          sessionStorage.setItem(environment.nombreOrganizacion, perfil.organizacion.acronimo);
          this.router.navigate(['/principal/dashboard']).then(() => {
           location.reload();
          });
          Swal.fire('Bienvenido al SISGEDO','', 'success');
        } else {
          console.error('No access_token in response');
        }
      },
      error: (err: any) => {
        Swal.fire('VERIFICACIÓN INCORRECTA', 'CÓDIGO INGRESADO NO ES VALIDO', 'info');
      }
    });


  }


}
