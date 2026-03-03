import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { LoginService } from 'src/app/_service/login.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-recovery',
  templateUrl: './modal-recovery.component.html',
  styleUrls: ['./modal-recovery.component.css']
})
export class ModalRecoveryComponent {

  cip: string = '';
  dni: string = '';
  correo: string = '';
  cargando: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ModalRecoveryComponent>,
    private loginService: LoginService
  ) {}

  recuperar(): void {
    if (!this.cip.trim() || !this.dni.trim() || !this.correo.trim()) {
      Swal.fire('ATENCIÓN', 'Por favor complete todos los campos.', 'warning');
      return;
    }

    this.cargando = true;
    this.loginService.recoverPassword({ cip: this.cip.trim(), dni: this.dni.trim(), correo: this.correo.trim() })
      .subscribe({
        next: (res: any) => {
          this.cargando = false;
          Swal.fire(
            '¡Contraseña Enviada!',
            res.mensaje || 'Se ha enviado una contraseña temporal a su correo. Vigente hasta las 23:59 hrs de hoy.',
            'success'
          );
          this.dialogRef.close();
        },
        error: (err: any) => {
          this.cargando = false;
          const mensaje = err?.error?.mensaje || 'No se encontró ningún usuario con esos datos.';
          Swal.fire('ERROR', mensaje, 'error');
        }
      });
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
