import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { EventsService } from '../../@core/services/events.service';
import { PaymentService, ReporteEvento } from '../../@core/services/payment.service';
import { Event } from '../../@core/models/event.model';
import { byDateAsc, CATEGORY_LABEL, EventCategory, formatTime12, parseEventDate } from '../../@core/utils/event-utils';

/**
 * Reporte de ventas de un evento: entradas por tipo y consumo por producto
 * (solo pagos aprobados). Se imprime o guarda en PDF con el diálogo del
 * navegador; los estilos de impresión ocultan el panel y dejan solo la hoja.
 */
@Component({
  selector: 'app-reportes',
  imports: [DatePipe, DecimalPipe, FormsModule],
  template: `
    <div class="container">
      <div class="table">
        <div class="catalog-head no-print">
          <div class="title">
            <h1>Reportes</h1>
            <p>Lo vendido en cada evento: entradas y consumo de los pagos aprobados.</p>
          </div>
          <div class="buttons">
            <label class="selector">
              <span>Evento</span>
              <select class="tm-select" [ngModel]="idEvento()" (ngModelChange)="elegir($event)">
                <option [ngValue]="null" disabled>Elige un evento</option>
                @for (ev of eventosOrdenados(); track ev.idEvents) {
                  <option [ngValue]="ev.idEvents">{{ ev.name }} · {{ fecha(ev) | date: 'dd/MM/yy' }}</option>
                }
              </select>
            </label>
            <button type="button" class="btn imprimir" [disabled]="!reporte()" (click)="imprimir()">
              <i class="pi pi-print"></i> Imprimir / PDF
            </button>
          </div>
        </div>

        @if (cargando()) {
          <div class="tm-skeleton hoja-sk" role="status" aria-label="Cargando reporte"></div>
        } @else if (error()) {
          <p class="vacio">{{ error() }}</p>
        } @else if (reporte()) {
          @let r = reporte()!;
          <article class="hoja">
            <header class="hoja-head">
              <div>
                <p class="marca">Mi Ternerita House · Reporte de ventas</p>
                <h2>{{ r.evento.nombre }}</h2>
                <p class="meta">
                  {{ fechaReporte() | date: "EEEE d 'de' MMMM, y" }} · {{ hora(r.evento.hora) }}
                  @if (r.evento.salon) { · {{ r.evento.salon }} }
                  · {{ categoria(r.evento.categoria) }}
                </p>
              </div>
              <dl class="cifras">
                <div><dt>Aforo</dt><dd>{{ r.evento.capacidad }}</dd></div>
                <div><dt>Entradas emitidas</dt><dd>{{ r.evento.vendidas }}</dd></div>
                <div><dt>Restantes</dt><dd>{{ restantes() }}</dd></div>
              </dl>
            </header>

            <section>
              <h3>Entradas</h3>
              @if (r.entradas.length) {
                <ul class="lineas">
                  @for (l of r.entradas; track l.nombre) {
                    <li>
                      <span class="nombre">{{ l.nombre }}</span>
                      <span class="puntos" aria-hidden="true"></span>
                      <span class="cant">{{ l.cantidad }} {{ l.cantidad === 1 ? 'entrada' : 'entradas' }}</span>
                      <strong>\${{ l.total | number: '1.2-2' }}</strong>
                    </li>
                  }
                </ul>
              } @else {
                <p class="vacio">Sin entradas cobradas.</p>
              }
              <p class="subtotal">Total entradas <strong>\${{ r.totales.entradas | number: '1.2-2' }}</strong></p>
            </section>

            <section>
              <h3>Consumo</h3>
              @if (r.consumo.length) {
                <ul class="lineas">
                  @for (l of r.consumo; track l.tipo + l.nombre) {
                    <li>
                      <span class="nombre">{{ l.nombre }}</span>
                      <span class="puntos" aria-hidden="true"></span>
                      <span class="cant">{{ l.cantidad }} {{ unidad(l) }}</span>
                      <strong>\${{ l.total | number: '1.2-2' }}</strong>
                    </li>
                  }
                </ul>
              } @else {
                <p class="vacio">Sin consumo cobrado.</p>
              }
              <p class="subtotal">Total consumo <strong>\${{ r.totales.consumo | number: '1.2-2' }}</strong></p>
            </section>

            <p class="total">Total vendido <strong>\${{ r.totales.general | number: '1.2-2' }}</strong></p>

            @if (r.pagos.length) {
              <section class="pagos">
                <h3>Pagos registrados</h3>
                <ul>
                  @for (p of r.pagos; track p.estado) {
                    <li>{{ p.estado }}: <strong>{{ p.cantidad }}</strong> (\${{ p.total | number: '1.2-2' }})</li>
                  }
                </ul>
                <p class="nota">Las ventas cuentan solo los pagos aprobados. Montos en USD.</p>
              </section>
            }

            <footer class="pie">Generado el {{ ahora | date: 'dd/MM/yyyy h:mm a' }}</footer>
          </article>
        } @else {
          <p class="vacio">Elige un evento para ver su reporte.</p>
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .selector {
      display: grid;
      gap: 4px;
      min-width: min(100%, 280px);

      span {
        color: var(--text-muted);
        font-size: 0.75rem;
        font-weight: 700;
      }
    }

    .imprimir::before {
      content: none !important;
    }

    .buttons {
      flex-wrap: wrap;
      align-items: flex-end;
    }

    .hoja-sk {
      height: 420px;
    }

    .vacio {
      color: var(--text-muted);
    }

    .hoja {
      display: grid;
      gap: 1.75rem;
      max-width: 820px;
      margin: 0 auto;
      padding: clamp(20px, 3vw, 36px);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface-2);
    }

    .hoja-head {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 1rem 2rem;
      padding-bottom: 1.25rem;
      border-bottom: 2px solid var(--border-strong);

      h2 {
        margin: 0.2rem 0;
        font-size: clamp(1.4rem, 3vw, 1.9rem);
      }
    }

    .marca {
      margin: 0;
      color: var(--primary);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .meta {
      margin: 0;
      color: var(--text-muted);
    }

    .cifras {
      display: flex;
      gap: 1.5rem;
      margin: 0;

      dt {
        color: var(--text-subtle);
        font-size: 0.72rem;
        text-transform: uppercase;
      }

      dd {
        margin: 0;
        font-size: 1.3rem;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
      }
    }

    h3 {
      margin: 0 0 0.75rem;
      font-size: 0.8rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--text-subtle);
    }

    .lineas {
      display: grid;
      gap: 0.55rem;
      margin: 0;
      padding: 0;
      list-style: none;

      li {
        display: flex;
        align-items: baseline;
        gap: 0.6rem;
      }
    }

    .nombre {
      font-weight: 700;
    }

    // Línea de puntos entre el nombre y el monto, como en un recibo.
    .puntos {
      flex: 1;
      min-width: 1rem;
      border-bottom: 2px dotted var(--border-strong);
      transform: translateY(-0.25em);
    }

    .cant {
      color: var(--text-muted);
      white-space: nowrap;
    }

    .lineas strong,
    .subtotal strong,
    .total strong {
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    .subtotal {
      margin: 0.75rem 0 0;
      text-align: right;
      color: var(--text-muted);
    }

    .total {
      margin: 0;
      padding-top: 1rem;
      border-top: 2px solid var(--border-strong);
      font-size: 1.25rem;
      text-align: right;

      strong {
        margin-left: 0.5rem;
        font-size: 1.6rem;
      }
    }

    .pagos ul {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem 1.5rem;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .nota,
    .pie {
      margin: 0.5rem 0 0;
      color: var(--text-subtle);
      font-size: 0.8rem;
    }

    @media (max-width: 560px) {
      .lineas li {
        flex-wrap: wrap;
      }

      .puntos {
        display: none;
      }

      .lineas strong {
        margin-left: auto;
      }
    }

    // Impresión: solo la hoja, en blanco y negro legible.
    @media print {
      .no-print {
        display: none !important;
      }

      .hoja {
        max-width: none;
        padding: 0;
        border: 0;
        background: #fff;
        color: #000;
      }

      .meta,
      .cant,
      .subtotal,
      .nota,
      .pie,
      h3,
      dt {
        color: #444 !important;
      }

      .marca {
        color: #000;
      }

      .lineas li {
        break-inside: avoid;
      }
    }
  `
})
export class ReportesComponent {
  private eventsService = inject(EventsService);
  private paymentService = inject(PaymentService);

  readonly ahora = new Date();
  readonly eventos = toSignal(this.eventsService.getEvents(), { initialValue: [] as Event[] });
  readonly eventosOrdenados = computed(() => [...this.eventos()].sort((a, b) => byDateAsc(b, a)));
  readonly idEvento = signal<number | null>(null);
  readonly reporte = signal<ReporteEvento | null>(null);
  readonly cargando = signal(false);
  readonly error = signal('');

  readonly fechaReporte = computed(() => parseEventDate(this.reporte()?.evento.fecha));
  readonly restantes = computed(() => {
    const e = this.reporte()?.evento;
    return e ? Math.max(e.capacidad - e.vendidas, 0) : 0;
  });

  fecha(ev: Event) {
    return parseEventDate(ev.date);
  }

  hora(time?: string | null) {
    return formatTime12(time);
  }

  categoria(c?: string | null) {
    return CATEGORY_LABEL[(c ?? 'evento') as EventCategory] ?? 'Evento';
  }

  /** "4 botellas" para las de 0,75 L (lo marca el back), "2 unidades" para el resto. */
  unidad(l: { cantidad: number; botella: boolean }) {
    return l.botella ? (l.cantidad === 1 ? 'botella' : 'botellas') : l.cantidad === 1 ? 'unidad' : 'unidades';
  }

  elegir(id: number | null) {
    this.idEvento.set(id);
    if (id === null) return;
    this.cargando.set(true);
    this.error.set('');
    this.paymentService
      .getReporte(id)
      .pipe(catchError(err => {
        this.error.set(err?.error?.message ?? 'No se pudo cargar el reporte');
        return of(null);
      }))
      .subscribe(r => {
        this.reporte.set(r);
        this.cargando.set(false);
      });
  }

  imprimir() {
    window.print();
  }
}
