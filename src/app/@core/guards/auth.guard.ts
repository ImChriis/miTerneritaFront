import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';
import { puedeVerPanel } from '../auth/roles';

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

/** Solo el personal (`user`) y el admin entran al panel; los clientes no. */
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  private auth = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  canActivate(): boolean | UrlTree {
    if (puedeVerPanel(this.auth.getUser()?.role)) return true;
    this.messageService.add({severity:'warn', summary: 'Acceso restringido', detail: 'No tienes permisos para entrar al panel.'});
    return this.router.createUrlTree(['/']);
  }
}
