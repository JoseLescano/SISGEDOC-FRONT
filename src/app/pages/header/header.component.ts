
import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CdkMenuModule } from '@angular/cdk/menu';
import { Perfil } from 'src/app/_model/perfil';
import { PerfilService } from 'src/app/_service/perfil.service';
import { Router } from '@angular/router';

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit {

  @Input() collapsed = false;
  @Input() screenWidth = 0;
  cargo : any = '';
  perfiles: Perfil[]=[];

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkCanShowSearchAsOverlay(window.innerWidth);
  }

  canShowSearchAsOverlay=false;

  ngOnInit(): void {
    this.checkCanShowSearchAsOverlay(window.innerWidth);
    this.cargo = sessionStorage.getItem(environment.cargoSeleccionado);
    this.perfilService.findByUsuariLogueado().subscribe((response:Perfil[])=> {
      this.perfiles = response;
    });
  }

  constructor(
    private perfilService: PerfilService,
    private router: Router
  ) { }

  getHeadClass(): string {
    let styleClass = '';
    if (this.collapsed && this.screenWidth > 768){
      styleClass = 'head-trimmed';
    }else {
      styleClass = 'head-md-screen';
    }
    return styleClass;
  }

  checkCanShowSearchAsOverlay(innerWidth: number): void{
    if(innerWidth<845){
      this.canShowSearchAsOverlay = true;
    }else {
      this.canShowSearchAsOverlay = false;
    }
  }

  seleccionarPerfil(perfil: any){
    sessionStorage.setItem(environment.rol, perfil.rol.codigo );
    sessionStorage.setItem(environment.codigoOrganizacion, perfil.organizacion.codigoInterno);
    sessionStorage.setItem(environment.cargoSeleccionado, perfil.nombre + ' - ' + perfil.organizacion.acronimo);

    this.router.navigate(['/principal/dashboard']).then(() => {
      // Do something
     location.reload();
    });
  }


}
