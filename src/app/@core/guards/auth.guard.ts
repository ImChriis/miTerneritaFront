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
    this.messageService.add({severity:'warn', summary: 'Inicia sesión', detail: 'Debes iniciar sesión para continuar.'});
    // redirige al login y guarda la url de retorno
    return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }
}

/** Solo deja pasar al panel a usuarios con rol distinto de 'user' (mismo criterio del login). */
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  private auth = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  canActivate(): boolean | UrlTree {
    const role = this.auth.getUser()?.role;
    if (role && role !== 'user') return true;
    this.messageService.add({severity:'warn', summary: 'Acceso restringido', detail: 'No tienes permisos para entrar al panel.'});
    return this.router.createUrlTree(['/']);
  }
}
