import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'tm-theme';
const THEME_COLOR: Record<Theme, string> = { dark: '#0A0A0C', light: '#F6F4EF' };

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private document = inject(DOCUMENT);

  /** Tema activo. El script de index.html ya lo aplicó antes del primer pintado. */
  readonly theme = signal<Theme>(this.readInitial());

  constructor() {
    this.apply(this.theme());
  }

  isDark() {
    return this.theme() === 'dark';
  }

  /**
   * Cambia el tema con un revelado circular que nace del punto donde se hizo clic.
   * Usa la View Transitions API cuando existe y, si no, un fundido de colores.
   */
  toggle(origin?: { x: number; y: number }) {
    const next: Theme = this.isDark() ? 'light' : 'dark';
    const root = this.document.documentElement;
    const win = this.document.defaultView;
    const reduceMotion = win?.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const startViewTransition = (this.document as any).startViewTransition?.bind(this.document);

    if (!startViewTransition || reduceMotion || !win || this.document.visibilityState !== 'visible') {
      root.classList.add('theme-fade');
      this.apply(next);
      win?.setTimeout(() => root.classList.remove('theme-fade'), 500);
      return;
    }

    const x = origin?.x ?? win.innerWidth - 40;
    const y = origin?.y ?? 36;
    const radius = Math.hypot(Math.max(x, win.innerWidth - x), Math.max(y, win.innerHeight - y));

    root.classList.add('theme-vt');
    const transition = startViewTransition(() => this.apply(next));

    transition.ready
      .then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 700, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' }
        );
      })
      .catch(() => {});

    transition.finished.finally(() => root.classList.remove('theme-vt'));
  }

  private apply(theme: Theme) {
    const root = this.document.documentElement;
    root.setAttribute('data-theme', theme);
    root.classList.toggle('app-dark', theme === 'dark');
    this.document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
    this.theme.set(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // almacenamiento no disponible (modo privado): el tema dura solo esta sesión
    }
  }

  private readInitial(): Theme {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  }
}
