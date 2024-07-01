
import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CdkMenuModule } from '@angular/cdk/menu';

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

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkCanShowSearchAsOverlay(window.innerWidth);
  }

  canShowSearchAsOverlay=false;

  ngOnInit(): void {
    this.checkCanShowSearchAsOverlay(window.innerWidth);
    this.cargo = sessionStorage.getItem(environment.cargoSeleccionado);
  }

  constructor(
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


}
