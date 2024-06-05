import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { Menu } from 'src/app/_model/menu';
import { Perfil } from 'src/app/_model/perfil';
import { MenuService } from 'src/app/_service/menu.service';
import { PerfilService } from 'src/app/_service/perfil.service';
import { environment } from 'src/environments/environment';

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({opacity: 0}),
        animate('350ms',
          style({opacity: 1})
        )
      ]),
      transition(':leave', [
        style({opacity: 1}),
        animate('350ms',
          style({opacity: 0})
        )
      ])
    ]),
    trigger('rotate', [
      transition(':enter', [
        animate('1000ms',
          keyframes([
            style({transform: 'rotate(0deg)', offset: '0'}),
            style({transform: 'rotate(2turn)', offset: '1'})
          ])
        )
      ])
    ])
  ]
})

export class HeaderComponent implements OnInit {

  listPerfil : any;
  isOffCanvasOpen: any;
  @Output() onToggleSideNav: EventEmitter<SideNavToggle> = new EventEmitter();
  collapsed = false;
  screenWidth = 0;
  perfiles: Perfil[];
  menus: Menu[];
  rolIngresado = environment.rol;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
    if(this.screenWidth <= 768 ) {
      this.collapsed = false;
      this.onToggleSideNav.emit({collapsed: this.collapsed, screenWidth: this.screenWidth});
    }
  }

  ngOnInit(): void {
      this.screenWidth = window.innerWidth;
      this.menuService.getMenuByRol(sessionStorage.getItem(environment.rol)).subscribe((response:any)=> {
        this.menus = response.data as Menu[];
      })
  }

  closeOffCanvas(){

  }

  openOffCanvas(){

  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.onToggleSideNav.emit({collapsed: this.collapsed, screenWidth: this.screenWidth});
  }

  closeSidenav(): void {
    this.collapsed = false;
    this.onToggleSideNav.emit({collapsed: this.collapsed, screenWidth: this.screenWidth});
  }

  constructor(private router: Router,
    private perfilService: PerfilService,
    private menuService: MenuService
  ) { }

  // @ViewChild('sidenav') sidenav: MatSidenav;
  // isExpanded = true;
  // showSubmenu: boolean = false;
  // isShowing = false;
  // showSubSubMenu: boolean = false;
  // codigo:any = environment.codigoOrganizacion;

  // mouseenter() {
  //   if (!this.isExpanded) {
  //     this.isShowing = true;
  //   }
  // }

  // mouseleave() {
  //   if (!this.isExpanded) {
  //     this.isShowing = false;
  //   }
  // }

  // toggleSidenavAndInit(tipoReporte: number): void {
  //   this.sidenav.toggle();
  //   this.router.navigate(['/buscar-documento/' + tipoReporte]);
  // }

}
