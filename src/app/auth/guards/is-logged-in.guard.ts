
import { environment } from 'src/environments/environment';
import { LoginService } from './../../_service/login.service';
import { MenuService } from 'src/app/_service/menu.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, map, switchMap } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { PerfilService } from 'src/app/_service/perfil.service';
import { Perfil } from 'src/app/_model/perfil';
import { Menu } from 'src/app/_model/menu';

@Injectable({
  providedIn: 'root'
})
export class IsLoggedInGuard implements CanActivate {

  perfiles:Perfil[] = [];

  constructor(private loginService: LoginService,
    private menuService: MenuService,
    private perfilService:PerfilService,
    private router: Router){}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {

      // 1) VERIFICAR SI EL USUARIO ESTA LOGUEADO
    let rpta = this.loginService.isLogged();
    if (!rpta){
      this.loginService.logout();
      return false
    }
    // 2) VERIFICAR SI EL TOKEN NO HA EXPIRADO
    const helper = new JwtHelperService();
    let token = sessionStorage.getItem(environment.TOKEN_NAME);
    if (!helper.isTokenExpired(token)){
      // 3) VERIFICAR SI TIENES EL ROL NECESARIO PARA ACCEDER  A ESE COMPONENTE 'PAGINA'
      let url = state.url;
      const decodedToken = helper.decodeToken(token);
      const username = decodedToken.sub;
      return this.menuService.getMenuByRol(sessionStorage.getItem(environment.rol)).pipe(map((response:any)=>{
        console.log(response.data)
        this.menuService.setMenuChange(response.data);
        let cont=0;
        for(let m of response.data){
          if (url.startsWith(m.url)){
            cont++;
            break;
          }
        }
        if(cont>0){
          return true;
        }else {
          this.router.navigate(['/pages/not-403']);
          return false;
        }
      }));
    }else {
      this.loginService.logout();
      return false;
    }
  }
}
