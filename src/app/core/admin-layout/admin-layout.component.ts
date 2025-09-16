import { CommonModule } from '@angular/common';
import { Component, inject, Renderer2 } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

interface RouteLayout {
  name: string;
  icon: string;
  routerLink: string;
}

@Component({
  selector: 'app-admin-layout',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent {
  private renderer2 = inject(Renderer2);

    routes: RouteLayout[] = [
    { 
      name: "Sitio Web",
      icon: "pi pi-globe",
      routerLink: "",
    },
    { 
      name: "Dashboard",
      icon: "pi pi-chart-bar",
      routerLink: "/admin/dashboard",
    },
    {
      name: "Eventos",
      icon: "pi pi-calendar",
      routerLink: "/admin/events",
    },
    {
      name: "Bebidas",
      icon: "pi pi-plus",
      routerLink: "/admin/drinks",
    },
    {
      name: "Comidas",
      icon: "pi pi-plus",
      routerLink: "/admin/foods",
    },
    {
      name: "Pagos",
      icon: "pi pi-money-bill",
      routerLink: "/admin/payments",
    },
    {
      name: "Usuarios",
      icon: "pi pi-users",
      routerLink: "/admin/users",
    },
  ]

  openSidebar(nav: HTMLElement) {
    this.renderer2.addClass(nav, 'open');
  }

  closeSidebar(nav: HTMLElement) {
    this.renderer2.removeClass(nav, 'open');
  }

  // logOut() {
  //   this.authService.logOut();
  // }
}
