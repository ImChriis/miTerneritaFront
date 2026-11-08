import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { TasaService } from '../../../@core/services/tasa.service';

/** Una línea del resumen: entrada (con id) o producto de consumo. */
export interface LineaResumen {
  id?: number;
  name: string;
  cantidad: number;
  total: number;
  /** Botellas: personas a las que da acceso General, por unidad. */
  personas?: number;
}

/**
 * Resumen de la compra: líneas de entradas y de consumo agrupadas, total en USD
 * y su equivalente en Bs a la tasa BCV del día.
 */
@Component({
  selector: 'app-price-summary',
  imports: [DecimalPipe, DatePipe],
  template: `
    @if (!entradas().length && !consumo().length) {
      <p class="vacio"><i class="pi pi-shopping-cart"></i> {{ vacio() }}</p>
    }

    @if (entradas().length) {
      <section class="grupo" aria-label="Entradas">
        <header>
          <span><i class="pi pi-ticket"></i> Entradas</span>
          @if (consumo().length) {
            <span class="sub">\${{ totalEntradas() | number: '1.2-2' }}</span>
          }
        </header>
        <ul>
          @for (l of entradas(); track $index) {
            <li>
              <span class="qty">{{ l.cantidad }}×</span>
              <div class="info">
                <strong>{{ l.name }}</strong>
                <small>{{ l.total > 0 ? '$' + (l.total / l.cantidad | number: '1.2-2') + ' c/u' : 'Incluida' }}</small>
              </div>
              <span class="amt">\${{ l.total | number: '1.2-2' }}</span>
              @if (quitable() && l.id !== undefined) {
                <button type="button" class="remove" [attr.aria-label]="'Quitar ' + l.name" (click)="quitar.emit(l.id!)">
                  <i class="pi pi-times"></i>
                </button>
              }
            </li>
          }
        </ul>
      </section>
    }

    @if (consumo().length) {
      <section class="grupo" aria-label="Consumo">
        <header>
          <span><i class="pi pi-shopping-bag"></i> Consumo</span>
          @if (entradas().length) {
            <span class="sub">\${{ totalConsumo() | number: '1.2-2' }}</span>
          }
        </header>
        <ul>
          @for (l of consumo(); track $index) {
            <li>
              <span class="qty">{{ l.cantidad }}×</span>
              <div class="info">
                <strong>{{ l.name }}</strong>
                <small>\${{ l.total / l.cantidad | number: '1.2-2' }} c/u</small>
                @if (l.personas) {
                  <span class="acceso"><i class="pi pi-users"></i> Acceso General para {{ l.personas * l.cantidad }}</span>
                }
              </div>
              <span class="amt">\${{ l.total | number: '1.2-2' }}</span>
            </li>
          }
        </ul>
      </section>
    }

    <div class="total">
      <div class="fila">
        <span>
          Total a pagar
          @if (personas()) {
            <small>{{ personas() }} {{ personas() === 1 ? 'persona' : 'personas' }}</small>
          }
        </span>
        <strong>\${{ total() | number: '1.2-2' }}</strong>
      </div>
      @if (bs() !== null) {
        <div class="fila bs">
          <span>En bolívares</span>
          <strong>Bs {{ bs() | number: '1.2-2' }}</strong>
        </div>
        <small class="tasa">
          Tasa BCV {{ tasa.tasa()?.valor | number: '1.2-4' }} Bs/$@if (tasa.tasa()?.fecha) { · {{ tasa.tasa()?.fecha | date: 'dd/MM' }}}
        </small>
      }
    </div>
  `,
  styles: `
    :host {
      display: grid;
      gap: 1rem;
    }

    .vacio {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin: 0;
      padding: 0.5rem 0;
      color: var(--text-muted);
    }

    .grupo header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.25rem;
      color: var(--text-subtle);
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;

      .pi {
        margin-right: 0.35rem;
        font-size: 0.75rem;
      }

      .sub {
        color: var(--text-muted);
        font-variant-numeric: tabular-nums;
        letter-spacing: 0;
      }
    }

    ul {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    li {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.65rem 0;

      & + li {
        border-top: 1px dashed var(--border);
      }
    }

    .qty {
      flex: none;
      min-width: 2.4rem;
      padding: 0.2rem 0.45rem;
      border-radius: var(--radius-xs);
      background: var(--surface-3);
      color: var(--text);
      font-size: 0.8rem;
      font-weight: 700;
      text-align: center;
      font-variant-numeric: tabular-nums;
    }

    .info {
      flex: 1;
      min-width: 0;
      display: grid;
      gap: 0.15rem;

      strong {
        line-height: 1.25;
      }

      small {
        color: var(--text-muted);
        font-size: 0.8rem;
      }
    }

    .acceso {
      justify-self: start;
      margin-top: 0.2rem;
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-pill);
      background: var(--success-soft);
      color: var(--success);
      font-size: 0.72rem;
      font-weight: 700;

      .pi {
        font-size: 0.7rem;
      }
    }

    .amt {
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    .remove {
      display: grid;
      place-items: center;
      flex: none;
      width: 26px;
      height: 26px;
      margin: -2px -4px 0 -6px;
      border: 0;
      border-radius: 50%;
      background: transparent;
      color: var(--text-subtle);
      cursor: pointer;

      @media (hover: hover) {
        &:hover {
          background: var(--danger-soft);
          color: var(--danger);
        }
      }

      .pi {
        font-size: 0.7rem;
      }
    }

    .total {
      display: grid;
      gap: 0.4rem;
      padding: 1rem;
      border-radius: var(--radius-md);
      background: var(--surface-2);
      border: 1px solid var(--border);
    }

    .fila {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 1rem;
      font-variant-numeric: tabular-nums;

      > span {
        font-weight: 700;
      }

      small {
        display: block;
        color: var(--text-muted);
        font-size: 0.78rem;
        font-weight: 400;
      }

      strong {
        font-size: 1.65rem;
        line-height: 1.1;
      }

      &.bs {
        padding-top: 0.4rem;
        border-top: 1px solid var(--border);

        > span {
          color: var(--text-muted);
          font-weight: 400;
        }

        strong {
          font-size: 1.05rem;
        }
      }
    }

    .tasa {
      color: var(--text-subtle);
      font-size: 0.75rem;
      text-align: right;
    }
  `
})
export class PriceSummaryComponent {
  readonly tasa = inject(TasaService);

  entradas = input<LineaResumen[]>([]);
  consumo = input<LineaResumen[]>([]);
  /** Muestra la X para quitar cada entrada (paso de entradas). */
  quitable = input(false);
  vacio = input('Aún no has elegido nada.');
  quitar = output<number>();

  totalEntradas = computed(() => this.entradas().reduce((s, l) => s + l.total, 0));
  totalConsumo = computed(() => this.consumo().reduce((s, l) => s + l.total, 0));
  total = computed(() => this.totalEntradas() + this.totalConsumo());
  /** Quienes entran: entradas compradas + acceso General de las botellas. */
  personas = computed(
    () =>
      this.entradas().reduce((s, l) => s + l.cantidad, 0) +
      this.consumo().reduce((s, l) => s + (l.personas ?? 0) * l.cantidad, 0)
  );
  bs = computed(() => this.tasa.bs(this.total()));
}
