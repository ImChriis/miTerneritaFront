import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { TasaService } from '../../../@core/services/tasa.service';

/**
 * Calculadora del total: entradas + consumo (si hay) = total en USD y su
 * equivalente en Bs a la tasa BCV del día.
 */
@Component({
  selector: 'app-price-summary',
  imports: [DecimalPipe, DatePipe],
  template: `
    @if (consumo() > 0) {
      <div class="row"><span>Entradas</span><span>\${{ entradas() | number: '1.2-2' }}</span></div>
      <div class="row"><span>Consumo</span><span>\${{ consumo() | number: '1.2-2' }}</span></div>
    }
    <div class="tm-summary-total">
      <span>
        Total
        @if (personas() !== null) {
          <small class="tm-muted">({{ personas() }} {{ personas() === 1 ? 'entrada' : 'entradas' }})</small>
        }
      </span>
      <strong>\${{ total() | number: '1.2-2' }}</strong>
    </div>
    @if (bs() !== null) {
      <p class="bs">
        <strong>Bs {{ bs() | number: '1.2-2' }}</strong>
        <small>Tasa BCV {{ tasa.tasa()?.valor | number: '1.2-4' }}@if (tasa.tasa()?.fecha) { · {{ tasa.tasa()?.fecha | date: 'dd/MM' }}}</small>
      </p>
    }
  `,
  styles: `
    :host {
      display: grid;
      gap: 6px;
    }

    .row {
      display: flex;
      justify-content: space-between;
      color: var(--text-muted);
      font-size: 0.9rem;
      font-variant-numeric: tabular-nums;
    }

    .bs {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.5rem;
      margin: 0;
      font-variant-numeric: tabular-nums;

      small {
        color: var(--text-muted);
      }
    }
  `
})
export class PriceSummaryComponent {
  readonly tasa = inject(TasaService);

  entradas = input(0);
  consumo = input(0);
  /** Personas que entran (entradas compradas + acceso de botellas). */
  personas = input<number | null>(null);

  total = computed(() => this.entradas() + this.consumo());
  bs = computed(() => this.tasa.bs(this.total()));
}
