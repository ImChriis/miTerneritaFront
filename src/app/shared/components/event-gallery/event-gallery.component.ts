import { Component, computed, input, signal } from '@angular/core';
import { GalleriaModule } from 'primeng/galleria';
import { EventPhoto } from '../../../@core/models/event.model';
import { eventImage } from '../../../@core/utils/event-utils';

/** Cartas por rueda: 24 x 15° = vuelta completa. */
const CARTAS = 24;
/** Fotos del mosaico por tanda ("Ver más"). */
const PASO = 24;

/** N fotos para decorar: repite si hay pocas, reparte si hay muchas. */
const repartir = (urls: string[], n: number) =>
  urls.length ? Array.from({ length: n }, (_, i) => (urls.length >= n ? urls[Math.floor((i * urls.length) / n)] : urls[i % urls.length])) : [];

/**
 * "Revive tu noche": mosaico de las fotos del evento con visor a pantalla
 * completa. En escritorio ancho, dos ruedas de fotos giran a los lados; en
 * pantallas más estrechas se cambian por dos cintas inclinadas.
 */
@Component({
  selector: 'app-event-gallery',
  imports: [GalleriaModule],
  template: `
    <section class="galeria" aria-labelledby="galeria-titulo">
      @for (lado of ['izq', 'der']; track lado) {
        <div class="riel" [class]="'riel--' + lado" aria-hidden="true">
          <div class="ventana">
            <div class="rueda">
              @for (src of lado === 'izq' ? ruedaIzq() : ruedaDer(); track $index) {
                <img class="carta" [src]="src" alt="" loading="lazy" [style.--i]="$index" />
              }
            </div>
          </div>
        </div>
      }

      <div class="tm-container centro">
        <header class="tm-section-head">
          <div>
            <p class="tm-eyebrow"><i class="pi pi-camera"></i> Revive tu noche</p>
            <h2 class="tm-h2" id="galeria-titulo">La noche en fotos</h2>
            <p class="tm-lead">{{ fotos().length }} {{ fotos().length === 1 ? 'foto' : 'fotos' }} de {{ nombre() }}.</p>
          </div>
        </header>

        <div class="cintas" aria-hidden="true">
          @for (fila of [ruedaDer(), ruedaIzq()]; track $index; let reversa = $odd) {
            <div class="cinta" [class.reversa]="reversa">
              @for (copia of [0, 1]; track copia) {
                <div class="pista">
                  @for (src of fila.slice(0, 10); track $index) {
                    <img [src]="src" alt="" loading="lazy" />
                  }
                </div>
              }
            </div>
          }
        </div>

        <ul class="mosaico">
          @for (f of visibles(); track f.idPhoto; let i = $index) {
            <li>
              <button type="button" (click)="abrir(i)" [attr.aria-label]="'Ver foto ' + (i + 1) + ' de ' + fotos().length">
                <img [src]="urls()[i]" alt="" loading="lazy" />
              </button>
            </li>
          }
        </ul>
        @if (visibles().length < fotos().length) {
          <button type="button" class="tm-btn tm-btn--ghost ver-mas" (click)="mostrar.set(mostrar() + paso)">
            Ver más fotos ({{ fotos().length - visibles().length }})
          </button>
        }
      </div>

      <p-galleria
        [value]="urls()"
        [(visible)]="visor"
        [(activeIndex)]="activa"
        [fullScreen]="true"
        [circular]="true"
        [showItemNavigators]="true"
        [showThumbnails]="false"
        [containerStyle]="{ width: '100%', 'max-width': '1100px' }"
      >
        <ng-template #item let-src>
          <img class="visor-img" [src]="src" [alt]="'Foto de ' + nombre()" />
        </ng-template>
      </p-galleria>
    </section>
  `,
  styles: `
    .galeria {
      --riel: 250px;
      --r: 540px;
      position: relative;
      overflow: clip;
      padding-block: clamp(40px, 6vw, 80px);
    }

    // ---------- Ruedas laterales (decoración) ----------
    .riel {
      display: none;
      position: absolute;
      top: 0;
      bottom: 0;
      width: var(--riel);
      pointer-events: none;
    }

    .riel--izq {
      left: 0;
    }

    .riel--der {
      right: 0;
    }

    // Se queda en pantalla mientras se recorre el mosaico.
    .ventana {
      position: sticky;
      top: var(--nav-h);
      height: calc(100vh - var(--nav-h));
      overflow: hidden;
      mask-image: linear-gradient(180deg, transparent, #000 18%, #000 82%, transparent);
      -webkit-mask-image: linear-gradient(180deg, transparent, #000 18%, #000 82%, transparent);
    }

    // Centro del círculo fuera del riel: solo se ve el arco cercano al contenido.
    .rueda {
      position: absolute;
      top: 50%;
      animation: girar 110s linear infinite;
    }

    .riel--der .rueda {
      left: calc(var(--r) + 110px);
    }

    .riel--izq .rueda {
      left: calc(var(--riel) - 110px - var(--r));
      animation-direction: reverse;
    }

    .carta {
      position: absolute;
      width: 168px;
      height: 112px;
      border-radius: var(--radius-sm);
      object-fit: cover;
      box-shadow: var(--shadow-md);
    }

    .riel--der .carta {
      transform: translate(-50%, -50%) rotate(calc(var(--i) * 15deg)) translateX(calc(-1 * var(--r)));
    }

    .riel--izq .carta {
      transform: translate(-50%, -50%) rotate(calc(var(--i) * 15deg)) translateX(var(--r));
    }

    @keyframes girar {
      to {
        transform: rotate(360deg);
      }
    }

    // ---------- Cintas (móvil y tablet) ----------
    .cintas {
      display: grid;
      gap: 10px;
      margin: 0 calc(-1 * var(--gutter)) 1.75rem;
      transform: rotate(-3deg);
    }

    .cinta {
      display: flex;
      overflow: hidden;
    }

    .pista {
      display: flex;
      flex-shrink: 0;
      gap: 10px;
      padding-right: 10px;
      animation: correr 45s linear infinite;

      img {
        height: 96px;
        width: 140px;
        border-radius: var(--radius-sm);
        object-fit: cover;
      }
    }

    .reversa .pista {
      animation-direction: reverse;
    }

    @keyframes correr {
      to {
        transform: translateX(-100%);
      }
    }

    // ---------- Mosaico ----------
    .mosaico {
      columns: 4 220px;
      column-gap: 12px;
      margin: 0;
      padding: 0;
      list-style: none;

      li {
        break-inside: avoid;
        margin-bottom: 12px;
      }

      button {
        display: block;
        width: 100%;
        padding: 0;
        border: 0;
        border-radius: var(--radius-md);
        overflow: hidden;
        background: var(--surface-2);
        cursor: zoom-in;

        &:focus-visible {
          outline: 3px solid var(--primary);
          outline-offset: 3px;
        }
      }

      img {
        display: block;
        width: 100%;
        height: auto;
        transition: transform var(--dur-slow) var(--ease-out);
      }

      @media (hover: hover) {
        button:hover img {
          transform: scale(1.04);
        }
      }
    }

    .ver-mas {
      display: flex;
      margin: 1.5rem auto 0;
    }

    .visor-img {
      display: block;
      max-width: 100%;
      max-height: 86vh;
      margin: 0 auto;
      object-fit: contain;
    }

    @media (min-width: 1280px) {
      .riel {
        display: block;
      }

      .cintas {
        display: none;
      }

      .centro {
        max-width: min(var(--container), calc(100% - 2 * var(--riel)));
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .rueda,
      .pista {
        animation: none;
      }
    }
  `
})
export class EventGalleryComponent {
  readonly fotos = input.required<EventPhoto[]>();
  readonly nombre = input('');

  readonly paso = PASO;
  readonly mostrar = signal(PASO);
  readonly visor = signal(false);
  readonly activa = signal(0);

  readonly urls = computed(() => this.fotos().map(f => eventImage(f.image)));
  readonly visibles = computed(() => this.fotos().slice(0, this.mostrar()));
  readonly ruedaDer = computed(() => repartir(this.urls(), CARTAS));
  // Otra mezcla para que los dos lados no muestren lo mismo a la vez.
  readonly ruedaIzq = computed(() => repartir([...this.urls()].reverse(), CARTAS));

  abrir(i: number) {
    this.activa.set(i);
    this.visor.set(true);
  }
}
