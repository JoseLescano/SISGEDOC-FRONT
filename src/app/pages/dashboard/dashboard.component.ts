import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DocumentoService } from 'src/app/_service/documento.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  pendientes: any = '000';
  parte: any = '000';
  atendidos : any = '000';

  constructor(
    private router: Router,
    private documentoService: DocumentoService
  ) { }

  ngOnInit(): void {
    this.contadoresDashboard();
  }

  contadoresDashboard(){
    let codigoOrganizacion = sessionStorage.getItem(environment.codigoOrganizacion);
    this.documentoService.contadoresDashboard(codigoOrganizacion).subscribe((response:any)=> {
      debugger;
      this.pendientes = response[0] < 10 ? '00'+ response[0]: 
                        response[0] < 99 && response[0] >10 ? '0'+ response[0]: 
                        response[0];
      this.parte = response[1] < 10 ? '00'+ response[1]: 
                  response[1] < 99 && response[1] >10 ? '0'+ response[1]: 
                  response[1];
    });
  }

  viewPendientes(){
    this.router.navigate(['/principal/pendientes']);
  }
  viewParteDiario(){
    this.router.navigate(['/principal/parte-diario']);
  }
  viewRemitidos(){
    this.router.navigate(['/principal/list-remitidos']);
  }

}
