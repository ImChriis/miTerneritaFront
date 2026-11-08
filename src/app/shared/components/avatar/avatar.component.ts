import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import boring, { AvatarVariant } from 'boring-avatars-vanilla';

/** Paleta de la marca (tokens y zonas del salón). */
const COLORES = ['#5b7cff', '#9b5bff', '#e0559b', '#2bb3a3', '#efe7d4'];

/** Semilla estable por persona: id, si no correo, si no nombre. Así el avatar no cambia al editar el nombre. */
export const avatarSeed = (u?: { id?: number | string | null; email?: string | null; name?: string | null } | null) =>
  String(u?.id ?? u?.email ?? u?.name ?? '?');

/**
 * Avatar generado (Boring Avatars) a partir de una semilla: misma persona,
 * mismo dibujo en toda la web. El tamaño lo da el CSS del host (.avatar…).
 */
@Component({
  selector: 'app-avatar',
  template: '',
  host: { '[innerHTML]': 'svg()', 'aria-hidden': 'true' },
  styles: `
    :host {
      display: inline-block;
      flex-shrink: 0;
      line-height: 0;
      overflow: hidden;
      border-radius: 50%;
    }

    :host ::ng-deep svg {
      display: block;
      width: 100%;
      height: 100%;
    }
  `
})
export class AvatarComponent {
  private sanitizer = inject(DomSanitizer);

  readonly seed = input.required<string>();
  readonly variant = input<AvatarVariant>('beam');

  // SVG generado por la librería a partir de un hash de la semilla (sin title, el texto no se inserta): seguro de confiar.
  readonly svg = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(boring({ name: this.seed(), variant: this.variant(), size: '100%', colors: COLORES }))
  );
}
