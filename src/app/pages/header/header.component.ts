
import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CdkMenuModule } from '@angular/cdk/menu';

import { Perfil } from 'src/app/_model/perfil';
import { PerfilService } from 'src/app/_service/perfil.service';
import { Router } from '@angular/router';
import { PersonaService } from 'src/app/_service/persona.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { switchMap } from 'rxjs';
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

  imagen: any;
  cargando = true;

  constructor(
    private personaService: PersonaService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.checkCanShowSearchAsOverlay(window.innerWidth);
    this.cargo = sessionStorage.getItem(environment.cargoSeleccionado);
    this.personaService.verFoto().subscribe(
      {
        next:(response: any)=> {
          const reader = new FileReader();
          reader.readAsDataURL(response);
          reader.onloadend = () => {
            this.imagen = reader.result as string;
            this.cargando = false;
          }
        },
        error: (err: any) => {
            console.error('Error al cargar la imagen', err);
            this.cargando = false;
            this.imagen = "../../../assets/person.jpeg";
        }
      }
    );

  }

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




}
