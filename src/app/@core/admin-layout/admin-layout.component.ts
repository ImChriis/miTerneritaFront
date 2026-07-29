import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, Renderer2 } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SettingsService } from '../services/settings.service';

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
export class AdminLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private renderer2 = inject(Renderer2);
  private router = inject(Router);
  private settingsService = inject(SettingsService);
  nombre!: string;
  lastName!: string;
  role!: string;
  instagram!: string;
  tiktok!: string;
  whatsapp!: string;


    ngOnInit(){
      const user = localStorage.getItem('user');
      if(user){
        const userObj = JSON.parse(user);
        this.nombre = userObj.name;
        this.lastName = userObj.lastName;
        this.role = userObj.role;
      }

      this.settingsService.getSettings().subscribe((data: any) => {
        this.instagram = data.instagram;
        this.tiktok = data.tiktok;
        this.whatsapp = data.whatsapp;
      })
    }

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
      name: "Entradas",
      icon: "pi pi-ticket",
      routerLink: "/admin/tickets",
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
    // {
    //   name: "Comidas",
    //   icon: "pi pi-plus",
    //   routerLink: "/admin/foods",
    // },
    {
      name: "Pagos",
      icon: "pi pi-money-bill",
      routerLink: "/admin/payments",
    },
    // {
    //   name: "Usuarios",
    //   icon: "pi pi-users",
    //   routerLink: "/admin/users",
    // },
  ]

  openSidebar(nav: HTMLElement) {
    this.renderer2.addClass(nav, 'open');
  }

  closeSidebar(nav: HTMLElement) {
    this.renderer2.removeClass(nav, 'open');
  }

  logOut() {
    this.authService.logout()
    this.router.navigateByUrl("/login");
  }
}
