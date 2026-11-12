import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { DOCUMENTOS, VIGENCIA } from '../../@core/data/legal';

/** Términos y condiciones, política de privacidad y aviso legal (/legal/:doc). */
@Component({
  selector: 'app-legal',
  imports: [RouterLink],
  template: `
    @if (doc(); as d) {
      <article class="tm-container legal">
        <nav class="legal-nav" aria-label="Documentos legales">
          <a routerLink="/legal/terminos" [class.active]="slug() === 'terminos'">Términos</a>
          <a routerLink="/legal/privacidad" [class.active]="slug() === 'privacidad'">Privacidad</a>
          <a routerLink="/legal/aviso-legal" [class.active]="slug() === 'aviso-legal'">Aviso legal</a>
        </nav>
        <h1 class="tm-h1">{{ d.titulo }}</h1>
        <p class="tm-lead">{{ d.intro }}</p>
        @for (s of d.secciones; track s.titulo) {
          <section>
            <h2>{{ s.titulo }}</h2>
            @for (p of s.parrafos ?? []; track $index) {
              <p>{{ p }}</p>
            }
            @if (s.lista?.length) {
              <ul>
                @for (item of s.lista; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            }
          </section>
        }
        <p class="vigencia">{{ vigencia }}</p>
      </article>
    }
  `,
  styles: `
    .legal {
      max-width: 780px;
      padding-block: clamp(28px, 5vw, 64px);
      line-height: 1.65;
    }

    .legal-nav {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 1.5rem;

      a {
        padding: 0.35rem 0.9rem;
        border: 1px solid var(--border);
        border-radius: var(--radius-pill);
        color: var(--text-muted);
        font-size: 0.85rem;
        font-weight: 700;
        text-decoration: none;

        &.active {
          border-color: transparent;
          background: var(--primary);
          color: var(--primary-contrast);
        }
      }
    }

    h2 {
      margin: 2rem 0 0.5rem;
      font-size: 1.1rem;
    }

    p,
    li {
      color: var(--text-muted);
    }

    ul {
      padding-left: 1.2rem;
    }

    .vigencia {
      margin-top: 2.5rem;
      font-size: 0.85rem;
      color: var(--text-subtle);
    }
  `
})
export class LegalComponent {
  readonly vigencia = VIGENCIA;
  slug = toSignal(inject(ActivatedRoute).paramMap.pipe(map(p => p.get('doc') ?? '')), { initialValue: '' });
  doc = computed(() => DOCUMENTOS[this.slug() as keyof typeof DOCUMENTOS] ?? null);
}
