import { inject, Injectable, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

/** Pone "Página · Mi Ternerita House" en la pestaña y expone el título para la UI (topbar admin). */
@Injectable({ providedIn: 'root' })
export class PageTitleStrategy extends TitleStrategy {
  private title = inject(Title);
  readonly current = signal('');

  override updateTitle(snapshot: RouterStateSnapshot) {
    const page = this.buildTitle(snapshot) ?? '';
    this.current.set(page);
    this.title.setTitle(page ? `${page} · Mi Ternerita House` : 'Mi Ternerita House');
  }
}
