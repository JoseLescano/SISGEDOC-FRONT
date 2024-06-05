import { ChangeDetectorRef, Component, EventEmitter, Inject, OnDestroy, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthenticationResponse } from 'src/app/_model/authentication-response';
import { VerificationRequest } from 'src/app/_model/verification-request';
import { LoginService } from 'src/app/_service/login.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-modal-mfa',
  templateUrl: './modal-mfa.component.html',
  styleUrls: ['./modal-mfa.component.css']
})
export class ModalMfaComponent implements OnInit, OnDestroy {

  @Output() cerrarDialogo = new EventEmitter<void>();
  status: any;
  secretImageUri: any;
  authResponse: AuthenticationResponse = {};
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
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    this.status = this.data.response.status;

    //console.log(this.data)
    if (this.status == "0") {
      this.saveTwoFactor();
    }

    // this.startDialogCloseTimer();
  }

  ngOnDestroy(): void {
    clearTimeout(this.dialogCloseTimer);
  }

  saveTwoFactor(): void {
    if (this.data.response.secretImageUri && !this.data.response.secretImageUri.startsWith('data:image/png;base64,')) {
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
    this.botonBloqueado = true;
    this.cd.detectChanges();
    //Ddd
    const verifyRequest: VerificationRequest = {
      username: this.data.username,
      code: this.otpCode
    };
    this.loginService.verifyCode(verifyRequest).subscribe({
      next: (response) => {
        sessionStorage.setItem(environment.TOKEN_NAME, response.access_token);
        this.router.navigate(['pages/dashboard']);
        this.cerrarDialogo.emit();
      },
    });
    setTimeout(() => {
      this.botonBloqueado = false;
    }, 3500);
  }}
