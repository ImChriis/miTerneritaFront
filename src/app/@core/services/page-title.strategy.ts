import { inject, Injectable, signal } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { SeoService } from './seo.service';

/**
 * Pone "Página · Mi Ternerita House" en la pestaña, expone el título para la UI
 * (topbar admin) y aplica el SEO de la ruta: `data.description` y `data.noindex`
 * (heredado de las rutas padre). Las páginas con datos propios (evento) lo
 * completan después con SeoService.
 */
@Injectable({ providedIn: 'root' })
export class PageTitleStrategy extends TitleStrategy {
  private seo = inject(SeoService);
  readonly current = signal('');

  override updateTitle(snapshot: RouterStateSnapshot) {
    const page = this.buildTitle(snapshot) ?? '';
    this.current.set(page);

    let data: Record<string, unknown> = {};
    for (let r: ActivatedRouteSnapshot | null = snapshot.root; r; r = r.firstChild) data = { ...data, ...r.data };

    this.seo.update({
      title: page === 'Inicio' ? undefined : page,
      description: data['description'] as string | undefined,
      noindex: !!data['noindex']
    });
  }
}
