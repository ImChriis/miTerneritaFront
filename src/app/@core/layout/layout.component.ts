import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, HostListener, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { SettingsService } from '../services/settings.service';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
import { AvatarComponent, avatarSeed } from '../../shared/components/avatar/avatar.component';
import { VENUE } from '../data/site';

interface NavItem {
  label: string;
  /** id de sección en la página de inicio */
  section?: string;
  route?: string;
}

import { puedeVerPanel } from '../auth/roles';
@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ThemeToggleComponent,
    AvatarComponent
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {
  private router = inject(Router);
  private document = inject(DOCUMENT);
  private settingsService = inject(SettingsService);
  authService = inject(AuthService);

  readonly venue = VENUE;
  readonly year = new Date().getFullYear();

  readonly nav: NavItem[] = [
    { label: 'Inicio', section: 'inicio' },
    { label: 'Eventos', section: 'eventos' },
    { label: 'Conciertos', section: 'conciertos' },
    { label: 'Pasados', section: 'pasados' },
    { label: 'Contacto', route: '/home/contact' }
  ];

  mobileOpen = signal(false);
  userMenuOpen = signal(false);
  scrolled = signal(false);
  activeSection = signal('inicio');
  private url = signal(this.router.url);

  isHome = computed(() => this.url().split(/[?#]/)[0] === '/');
  /** Flujo de compra (entradas, consumo, datos, pago): sin el footer completo. */
  inFlow = computed(() => /\/ticket(\/|$)|^\/concierto$/.test(this.url().split(/[?#]/)[0]));
  /** Sobre el hero de la home la barra es transparente con texto claro. */
  overHero = computed(() => this.isHome() && !this.scrolled() && !this.mobileOpen());

  instagram = signal('');
  tiktok = signal('');
  whatsapp = signal('');
  email = signal('');

  user = computed(() => (this.authService.isAuthenticated() ? this.authService.getUser() : null));
  readonly seed = avatarSeed;
  isStaff = computed(() => puedeVerPanel(this.user()?.role));

  constructor() {
    // Bloquea el scroll del fondo con el menú móvil abierto
    effect(() => this.document.body.classList.toggle('tm-no-scroll', this.mobileOpen()));
  }

  ngOnInit() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(e => {
      this.url.set((e as NavigationEnd).urlAfterRedirects);
      this.mobileOpen.set(false);
      this.userMenuOpen.set(false);
      this.onScroll();
    });

    this.settingsService.getSettings().subscribe((data: any) => {
      this.instagram.set(data?.instagram ?? '');
      this.tiktok.set(data?.tiktok ?? '');
      this.email.set(data?.email ? `mailto:${data.email}` : '');
      const phone = String(data?.phone ?? '').replace(/\D/g, '').replace(/^0/, '');
      this.whatsapp.set(phone.length >= 10 ? `https://wa.me/58${phone}` : '');
    });

    this.onScroll();
  }

  @HostListener('window:scroll')
  onScroll() {
    const win = this.document.defaultView;
    if (!win) return;
    this.scrolled.set(win.scrollY > 24);

    if (!this.isHome()) return;
    // Scroll-spy: la sección cuyo borde superior pasó la mitad superior de la pantalla
    let current = 'inicio';
    for (const id of ['eventos', 'conciertos', 'pasados']) {
      const el = this.document.getElementById(id);
      if (el && el.getBoundingClientRect().top < win.innerHeight * 0.35) current = id;
    }
    this.activeSection.set(current);
  }

  @HostListener('document:keydown.escape')
  closeMenus() {
    this.mobileOpen.set(false);
    this.userMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.user-menu')) {
      this.userMenuOpen.set(false);
    }
  }

  isActive(item: NavItem) {
    if (item.section) return this.isHome() && this.activeSection() === item.section;
    return false;
  }

  goTo(item: NavItem, event?: Event) {
    event?.preventDefault();
    this.mobileOpen.set(false);

    if (item.route) {
      this.router.navigateByUrl(item.route);
      return;
    }

    const id = item.section!;
    if (this.isHome()) {
      if (id === 'inicio') {
        this.document.defaultView?.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        this.document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }
    this.router.navigate(['/'], { fragment: id === 'inicio' ? undefined : id });
  }

  logout() {
    this.authService.logout();
    this.userMenuOpen.set(false);
    this.mobileOpen.set(false);
    this.router.navigateByUrl('/');
  }
}
