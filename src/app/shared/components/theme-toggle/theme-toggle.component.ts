import { Component, inject } from '@angular/core';
import { ThemeService } from '../../../@core/services/theme.service';

let nextId = 0;

@Component({
  selector: 'app-theme-toggle',
  template: `
    <button
      type="button"
      class="theme-toggle"
      [class.is-dark]="theme.isDark()"
      [attr.aria-label]="theme.isDark() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
      [attr.title]="theme.isDark() ? 'Modo claro' : 'Modo oscuro'"
      (click)="toggle($event)"
    >
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <mask [attr.id]="maskId">
          <rect x="0" y="0" width="24" height="24" fill="white" />
          <circle class="moon-cut" cx="25" cy="8" r="7" fill="black" />
        </mask>
        <circle class="sun" cx="12" cy="12" r="5" fill="currentColor" [attr.mask]="'url(#' + maskId + ')'" />
        <g class="beams" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="12" y1="1.5" x2="12" y2="3.5" />
          <line x1="12" y1="20.5" x2="12" y2="22.5" />
          <line x1="1.5" y1="12" x2="3.5" y2="12" />
          <line x1="20.5" y1="12" x2="22.5" y2="12" />
          <line x1="4.6" y1="4.6" x2="6" y2="6" />
          <line x1="18" y1="18" x2="19.4" y2="19.4" />
          <line x1="4.6" y1="19.4" x2="6" y2="18" />
          <line x1="18" y1="6" x2="19.4" y2="4.6" />
        </g>
      </svg>
    </button>
  `,
  styles: `
    :host {
      display: inline-flex;
    }

    .theme-toggle {
      display: inline-grid;
      place-items: center;
      width: 42px;
      height: 42px;
      padding: 0;
      border-radius: 50%;
      border: 1px solid var(--border);
      background: var(--surface-2);
      color: var(--text);
      cursor: pointer;
      transition:
        background-color var(--dur) var(--ease-out),
        border-color var(--dur) var(--ease-out),
        transform var(--dur-fast) var(--ease-out);
    }

    .theme-toggle:active {
      transform: scale(0.9);
    }

    @media (hover: hover) {
      .theme-toggle:hover {
        background: var(--surface-3);
        border-color: var(--border-strong);
      }

      .theme-toggle:hover .beams {
        transform: rotate(45deg);
      }
    }

    svg {
      overflow: visible;
    }

    .sun,
    .beams,
    .moon-cut {
      transform-box: fill-box;
      transform-origin: center;
    }

    .sun {
      transition: transform 0.6s var(--ease-out-expo);
    }

    .beams {
      transform-box: view-box;
      transition:
        transform 0.6s var(--ease-out-expo),
        opacity 0.4s var(--ease-out);
    }

    .moon-cut {
      transition: transform 0.5s var(--ease-out);
    }

    /* Modo oscuro: el sol crece y la máscara lo convierte en luna */
    .is-dark .sun {
      transform: scale(1.75);
    }

    .is-dark .moon-cut {
      transform: translate(-8px, 0);
    }

    .is-dark .beams {
      opacity: 0;
      transform: rotate(-60deg) scale(0.4);
    }
  `
})
export class ThemeToggleComponent {
  readonly theme = inject(ThemeService);
  readonly maskId = `tm-moon-mask-${nextId++}`;

  toggle(event: MouseEvent) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.theme.toggle({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  }
}
