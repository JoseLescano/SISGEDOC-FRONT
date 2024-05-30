import swal from 'sweetalert2'
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Perfil } from 'src/app/_model/perfil';
import { environment } from 'src/environments/environment';

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
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  login(){
    environment.TOKEN_AUTH_USERNAME= this.username;
    this.router.navigate(['/perfiles']);
  }



}
