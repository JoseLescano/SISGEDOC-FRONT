import swal from 'sweetalert2'
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PerfilService } from 'src/app/_service/perfil.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username: string;
  password: string;
  hide : boolean = true;

  constructor(
    private perfilService: PerfilService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  login(){
    // debugger;
    // this.perfilService.loginActiveDirectory(this.username,this.password).subscribe((response:any)=> {
    //   if(response.httpStatus=='OK'){
        this.router.navigate(['/principal']);
    //     Swal.fire(response.message, 'Bienvenido al sistema usuario', 'success');
    //   }else {
    //     Swal.fire('LO SENTIMOS', 'USUARIO NO EXISTE EN ACTIVE DIRECTORY', 'info');
    //   }
    // }, error => {
    //   Swal.fire('LO SENTIMOS', 'SE PRESENTO UN INCONVENINTE EN LA VALIDACION DEL USUARIO', 'info');
    // })
    
    
   
  }

}
