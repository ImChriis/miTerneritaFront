import { DecimalPipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { VenueZone } from '../venue-map/venue-map.component';

/** Zonas del salón de Mi Ternerita, en coordenadas del viewBox (320 x 450). */
const SALON = [
  { key: 'general', label: 'General', x: 96, y: 6, w: 168, h: 136, vertical: false, color: '#5b7cff' },
  { key: 'palco a', label: 'Palco A', x: 8, y: 154, w: 58, h: 196, vertical: true, color: '#9b5bff' },
  { key: 'vip', label: 'VIP', x: 74, y: 154, w: 190, h: 196, vertical: false, color: '#e0559b' },
  { key: 'palco b', label: 'Palco B', x: 272, y: 222, w: 36, h: 114, vertical: true, color: '#2bb3a3' }
];

const normalizar = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

/**
 * Plano real del salón (General, VIP, Palco A, Palco B y escenario). Recibe las
 * mismas zonas que app-venue-map: cada entrada se coloca en su zona por nombre
 * ("General", "General B", "VIP", "Palco A"...). Una zona sin entrada a la venta
 * se pinta deshabilitada.
 */
@Component({
  selector: 'app-salon-map',
  imports: [DecimalPipe],
  template: `
    <div class="salon">
      <svg viewBox="0 0 320 450" role="group" aria-label="Mapa del salón">
        @for (a of areas(); track a.key) {
          <g
            class="zone"
            [class.is-active]="a.active"
            [class.has-qty]="a.qty > 0"
            [class.is-off]="!a.id"
            [style.--zc]="a.color"
            [attr.role]="a.id ? 'button' : null"
            [attr.tabindex]="a.id ? 0 : -1"
            [attr.aria-pressed]="a.id ? a.active : null"
            [attr.aria-disabled]="a.id ? null : true"
            [attr.aria-label]="a.label + (a.price !== null ? ', $' + a.price : ', no disponible')"
            (click)="elegir(a.id)"
            (keydown.enter)="elegir(a.id)"
            (keydown.space)="$event.preventDefault(); elegir(a.id)"
          >
            <rect [attr.x]="a.x" [attr.y]="a.y" [attr.width]="a.w" [attr.height]="a.h" rx="14" />
            <g [attr.transform]="a.vertical ? 'rotate(-90 ' + a.cx + ' ' + a.cy + ')' : null">
              <text class="name" [attr.x]="a.cx" [attr.y]="a.cy - 4">{{ a.label }}</text>
              <text class="price" [attr.x]="a.cx" [attr.y]="a.cy + 13">
                @if (a.price === null) {
                  No disponible
                } @else {
                  {{ a.desde ? 'Desde ' : '' }}\${{ a.price | number: '1.0-2' }}
                }
              </text>
            </g>
            @if (a.qty > 0) {
              <circle class="qty" [attr.cx]="a.x + a.w - 4" [attr.cy]="a.y + 4" r="11" />
              <text class="qty-n" [attr.x]="a.x + a.w - 4" [attr.y]="a.y + 8">{{ a.qty }}</text>
            }
          </g>
        }
        <path class="stage" d="M82 362 H238 V390 L214 442 H106 L82 390 Z" />
        <text class="stage-name" x="160" y="404">Escenario</text>
      </svg>

      <div class="legend">
        <span><i class="sw sw-free"></i>Disponible</span>
        <span><i class="sw sw-on"></i>Seleccionada</span>
        <span><i class="sw sw-off"></i>No disponible</span>
      </div>
    </div>
  `,
  styles: `
    .salon {
      display: grid;
      gap: 14px;
      padding: clamp(14px, 3vw, 24px);
      border-radius: var(--radius-lg);
      background:
        radial-gradient(80% 60% at 50% 100%, var(--primary-soft), transparent 70%),
        var(--surface-2);
      border: 1px solid var(--border);
    }

    svg {
      display: block;
      width: 100%;
      max-width: 420px;
      margin: 0 auto;
      overflow: visible;
    }

    .zone {
      cursor: pointer;
      outline: none;

      rect {
        fill: color-mix(in srgb, var(--zc) 16%, transparent);
        stroke: color-mix(in srgb, var(--zc) 60%, transparent);
        stroke-width: 1.5;
        transition:
          fill var(--dur) var(--ease-out),
          stroke var(--dur) var(--ease-out);
      }

      &:hover rect,
      &:focus-visible rect {
        fill: color-mix(in srgb, var(--zc) 28%, transparent);
        stroke: var(--zc);
      }

      &:focus-visible rect {
        stroke-width: 3;
      }

      &.is-active rect {
        fill: var(--zc);
        stroke: var(--zc);
      }

      &.is-active text {
        fill: #fff;
      }

      &.is-off {
        cursor: not-allowed;

        rect {
          fill: var(--surface-3);
          stroke: var(--border);
          stroke-dasharray: 5 4;
        }

        text {
          fill: var(--text-subtle);
        }
      }
    }

    text {
      fill: var(--text);
      text-anchor: middle;
      pointer-events: none;
    }

    .name {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .price {
      font-size: 12px;
      font-weight: 700;
      fill: var(--text-muted);
      font-variant-numeric: tabular-nums;
    }

    .qty {
      fill: var(--text);
    }

    .qty-n {
      fill: var(--bg);
      font-size: 12px;
      font-weight: 700;
    }

    .stage {
      fill: var(--surface-3);
      stroke: var(--border-strong);
      stroke-width: 1.5;
      stroke-linejoin: round;
    }

    .stage-name {
      fill: var(--text-muted);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.3em;
      text-transform: uppercase;
    }

    .legend {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.5rem 1.25rem;
      color: var(--text-muted);
      font-size: 0.8rem;

      span {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
      }
    }

    .sw {
      width: 12px;
      height: 12px;
      border-radius: 4px;
    }

    .sw-free {
      background: var(--primary-soft);
      border: 1.5px solid var(--primary);
    }

    .sw-on {
      background: var(--primary);
    }

    .sw-off {
      background: var(--surface-3);
      border: 1.5px dashed var(--border-strong);
    }
  `
})
export class SalonMapComponent {
  zones = input.required<VenueZone[]>();
  active = input<number | null>(null);
  pick = output<number>();

  areas = computed(() =>
    SALON.map(area => {
      const entradas = this.zones()
        .filter(z => normalizar(z.name).startsWith(area.key))
        .sort((a, b) => a.price - b.price);
      const precios = new Set(entradas.map(z => z.price));
      return {
        ...area,
        cx: area.x + area.w / 2,
        cy: area.y + area.h / 2,
        // Al tocar la zona se agrega la entrada más barata de esa zona.
        id: entradas[0]?.id ?? null,
        price: entradas[0]?.price ?? null,
        desde: precios.size > 1,
        qty: entradas.reduce((suma, z) => suma + z.qty, 0),
        active: entradas.some(z => z.id === this.active())
      };
    })
  );

  elegir(id: number | null) {
    if (id !== null) this.pick.emit(id);
  }
}
