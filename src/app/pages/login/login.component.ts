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
    debugger;
    // this.router.navigate(['/principal']);
    this.router.navigate(['/perfiles']);


  }

}
