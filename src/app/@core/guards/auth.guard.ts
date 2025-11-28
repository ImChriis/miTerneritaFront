import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private auth = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const logged = this.auth.isAuthenticated(); // signal computed -> call it
    if (logged) return true;
    this.messageService.add({severity:'warn', summary: 'Acceso denegado', detail: 'Debes iniciar sesión para acceder a esta página.'});
    // redirige al login y guarda la url de retorno
    return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }
}