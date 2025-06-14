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

  cargando: boolean = false;
  pendientes: any = '000';
  parte: any = '000';
  devueltos : any = '000';
  corregir: any = '000';
  codigoRol : any = sessionStorage.getItem(environment.rol);

  //==============================================================================

  constructor(
    private router: Router,
    private documentoService: DocumentoService
  ) { }

  ngOnInit(): void {
    this.cargando = true;
    this.contadoresDashboard();
    this.cargando = false;

  }

  //==============================================================================
  contadoresDashboard(){

    let codigoOrganizacion = sessionStorage.getItem(environment.codigoOrganizacion);
    this.documentoService.contadoresDashboard(codigoOrganizacion).subscribe((response:any)=> {
      this.pendientes = response[0] < 10 ? '000'+ response[0]:
                        (response[0] < 99 && response[0] >9) ? '00'+ response[0]:
                        response[0];
      this.parte = response[1] < 10 ? '000'+ response[1]:
                  (response[1] < 99 && response[1] >9) ? '00'+ response[1]:
                  response[1];
      this.devueltos = response[2] < 10 ? '000'+ response[2]:
                  (response[2] < 99 && response[2] >9) ? '00'+ response[2]:
                  response[2];
      this.corregir = response[3] < 10 ? '000'+ response[3]:
                  (response[3] < 99 && response[3] >9) ? '00'+ response[3]:
                  response[3];
    });

    }

  viewPendientes(){
    this.router.navigate(['/principal/pendientes']);
  }
  viewParteDiario(){
    this.router.navigate(['/principal/parte-diario']);
  }
  viewDevueltos(){
    this.router.navigate(['/principal/documentos-devueltos']);
  }

  viewCorregir(){
    this.router.navigate(['/principal/documentos-corregir']);
  }

}
