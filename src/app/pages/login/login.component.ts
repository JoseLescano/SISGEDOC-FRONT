import swal from 'sweetalert2'
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username: string;
  password: string;
  message: string;
  error: string;

  constructor(
    
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  login(){
    this.router.navigate(['/principal']);
    
    
   
  }

}
