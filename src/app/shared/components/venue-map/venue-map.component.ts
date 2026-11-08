import { DecimalPipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';

export interface VenueZone {
  id: number;
  name: string;
  price: number;
  qty: number;
}

const ZONE_COLORS = ['#5b7cff', '#9b5bff', '#e0559b', '#f2994a', '#2bb3a3', '#56a3f2'];

/**
 * Plano referencial por zonas: las zonas más caras quedan más cerca del escenario.
 * Cuando exista el plano real del local se reemplaza el bloque .zones por el SVG
 * con secciones/mesas/asientos manteniendo la misma API (zones / active / pick).
 */
@Component({
  selector: 'app-venue-map',
  imports: [DecimalPipe],
  template: `
    <div class="venue">
      <div class="stage"><span>Escenario</span></div>

      <div class="zones">
        @for (z of ordered(); track z.id; let i = $index) {
          <button
            type="button"
            class="zone"
            [class.is-active]="z.id === active()"
            [class.has-qty]="z.qty > 0"
            [style.--zc]="color(i)"
            [style.width.%]="62 + (38 * i) / Math.max(ordered().length - 1, 1)"
            [attr.aria-pressed]="z.id === active()"
            [attr.aria-label]="z.name + ', $' + z.price"
            (click)="pick.emit(z.id)"
          >
            <strong>{{ z.name }}</strong>
            <small>\${{ z.price | number: '1.0-2' }}</small>
            @if (z.qty > 0) {
              <span class="qty">{{ z.qty }}</span>
            }
          </button>
        }
      </div>

      <div class="legend">
        <span><i class="sw sw-free"></i>Disponible</span>
        <span><i class="sw sw-on"></i>Seleccionada</span>
      </div>
    </div>
  `,
  styles: `
    .venue {
      display: grid;
      gap: 18px;
      padding: clamp(18px, 3vw, 28px);
      border-radius: var(--radius-lg);
      background:
        radial-gradient(80% 60% at 50% 0%, var(--primary-soft), transparent 70%),
        var(--surface-2);
      border: 1px solid var(--border);
    }

    .stage {
      position: relative;
      justify-self: center;
      width: 70%;
      padding: 14px 0 22px;
      text-align: center;
      border-radius: 50% 50% 14px 14px / 30% 30% 14px 14px;
      background: linear-gradient(180deg, var(--surface-3), var(--surface));
      border: 1px solid var(--border-strong);
      color: var(--text-muted);
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.32em;
      text-transform: uppercase;
      box-shadow: 0 18px 40px -18px var(--primary-glow);
    }

    .zones {
      display: grid;
      justify-items: center;
      gap: 10px;
    }

    .zone {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      min-height: 58px;
      padding: 0 18px;
      border-radius: 14px 14px 22px 22px;
      border: 1.5px solid color-mix(in srgb, var(--zc) 55%, transparent);
      background: color-mix(in srgb, var(--zc) 16%, transparent);
      color: var(--text);
      cursor: pointer;
      transition:
        transform var(--dur) var(--ease-out-expo),
        background-color var(--dur) var(--ease-out),
        box-shadow var(--dur) var(--ease-out);

      strong {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      small {
        color: var(--text-muted);
        font-weight: 700;
        font-variant-numeric: tabular-nums;
      }

      @media (hover: hover) {
        &:hover {
          transform: translateY(-2px);
          background: color-mix(in srgb, var(--zc) 26%, transparent);
        }
      }

      &.is-active {
        background: var(--zc);
        border-color: var(--zc);
        color: #fff;
        box-shadow: 0 14px 30px -12px var(--zc);

        small {
          color: rgba(255, 255, 255, 0.85);
        }
      }
    }

    .qty {
      position: absolute;
      top: -9px;
      right: -9px;
      display: grid;
      place-items: center;
      min-width: 24px;
      height: 24px;
      padding: 0 6px;
      border-radius: 99px;
      background: var(--text);
      color: var(--bg);
      font-size: 0.75rem;
      font-weight: 700;
      animation: pop 0.35s var(--ease-out-expo);
    }

    @keyframes pop {
      from {
        transform: scale(0.4);
      }
    }

    .legend {
      display: flex;
      justify-content: center;
      gap: 1.25rem;
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
  `
})
export class VenueMapComponent {
  readonly Math = Math;

  zones = input.required<VenueZone[]>();
  active = input<number | null>(null);
  pick = output<number>();

  /** Más caro = más cerca del escenario */
  ordered = computed(() => [...this.zones()].sort((a, b) => b.price - a.price));

  color(i: number) {
    return ZONE_COLORS[i % ZONE_COLORS.length];
  }
}
