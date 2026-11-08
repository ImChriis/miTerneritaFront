import { DOCUMENT } from '@angular/common';
import { Component, effect, HostListener, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { PageTitleStrategy } from '../services/page-title.strategy';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
import { AvatarComponent, avatarSeed } from '../../shared/components/avatar/avatar.component';

interface RouteLayout {
  name: string;
  icon: string;
  routerLink: string;
}

interface RouteGroup {
  label: string;
  items: RouteLayout[];
}

const COLLAPSE_KEY = 'tm-admin-collapsed';

@Component({
  selector: 'app-admin-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ThemeToggleComponent,
    AvatarComponent
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private document = inject(DOCUMENT);
  readonly pageTitle = inject(PageTitleStrategy).current;

  nombre = '';
  lastName = '';
  role = '';
  readonly year = new Date().getFullYear();

  mobileOpen = signal(false);
  collapsed = signal(this.readCollapsed());
  seed = '?';

  readonly groups: RouteGroup[] = [
    {
      label: 'General',
      items: [{ name: 'Dashboard', icon: 'pi pi-chart-bar', routerLink: '/admin/dashboard' }]
    },
    {
      label: 'Ventas',
      items: [
        { name: 'Eventos', icon: 'pi pi-calendar', routerLink: '/admin/events' },
        { name: 'Entradas', icon: 'pi pi-ticket', routerLink: '/admin/tickets' },
        { name: 'Pagos', icon: 'pi pi-wallet', routerLink: '/admin/payments' },
        { name: 'Bebidas', icon: 'pi pi-box', routerLink: '/admin/drinks' },
        { name: 'Comidas', icon: 'pi pi-shopping-bag', routerLink: '/admin/foods' }
      ]
    },
    {
      label: 'Personas',
      items: [
        { name: 'Usuarios', icon: 'pi pi-user', routerLink: '/admin/users' },
        { name: 'Clientes', icon: 'pi pi-users', routerLink: '/admin/clients' }
      ]
    }
  ];

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(COLLAPSE_KEY, this.collapsed() ? '1' : '0');
      } catch {}
    });
    effect(() => this.document.body.classList.toggle('tm-no-scroll', this.mobileOpen()));
  }

  ngOnInit() {
    const user = localStorage.getItem('user');
    if (user) {
      const userObj = JSON.parse(user);
      this.nombre = userObj.name ?? '';
      this.lastName = userObj.lastName ?? '';
      this.role = userObj.role ?? '';
      this.seed = avatarSeed(userObj);
    }

    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => this.mobileOpen.set(false));
  }

  @HostListener('document:keydown.escape')
  closeMobile() {
    this.mobileOpen.set(false);
  }

  toggleSidebar() {
    if (this.document.defaultView && this.document.defaultView.innerWidth < 1024) {
      this.mobileOpen.set(!this.mobileOpen());
    } else {
      this.collapsed.set(!this.collapsed());
    }
  }

  logOut() {
    this.authService.logout()
    this.router.navigateByUrl("/login");
  }

  private readCollapsed() {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1';
    } catch {
      return false;
    }
  }
}
