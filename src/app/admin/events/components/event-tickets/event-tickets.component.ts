import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { catchError, forkJoin, Observable, of } from 'rxjs';
import { TicketsService } from '../../../../@core/services/tickets.service';
import { Ticket } from '../../../../@core/models/ticket.model';

/** Entradas que trae cada tipo de evento. Las que falten se crean al guardar. */
const TIPOS_BASE = ['General', 'VIP'];
const TIPOS_CONCIERTO = ['General', 'VIP', 'Palco A', 'Palco B'];

/** 'Palco A' -> 'palco a', sin tildes: mismo criterio que el backend para reconocer la General. */
const clave = (texto: string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

interface Fila {
  idTicket?: number;
  /** Tipo base de una fila nueva (aún sin guardar). */
  tipo?: string;
  name: string;
  price: number | null;
  status: number;
  /** Lo que hay en la BD, para mandar solo lo que cambió. */
  antes?: string;
}

const firma = (f: Pick<Fila, 'name' | 'price' | 'status'>) => JSON.stringify([f.name.trim(), Number(f.price ?? 0), f.status]);

/**
 * Entradas de un evento dentro del modal de crear/editar. Muestra las que ya
 * tiene y añade las de su tipo que falten (General y VIP; en conciertos también
 * Palco A y B). El modal llama a guardar() después de guardar el evento.
 */
@Component({
  selector: 'app-event-tickets',
  imports: [FormsModule, InputText, ToggleSwitch],
  template: `
    <section class="adm-section">
      <h3>Entradas</h3>
      <ul class="entradas">
        @for (f of filas(); track $index; let i = $index) {
          <li>
            <div class="adm-field">
              <label [for]="'en-nombre-' + i">Nombre</label>
              <input pInputText [id]="'en-nombre-' + i" [(ngModel)]="f.name" maxlength="150" />
            </div>
            <div class="adm-field">
              <label [for]="'en-precio-' + i">Precio</label>
              <div class="adm-prefix">
                <span>$</span>
                <input pInputText [id]="'en-precio-' + i" type="number" min="0" step="0.01" [(ngModel)]="f.price" placeholder="0.00" />
              </div>
            </div>
            <label class="estado" [for]="'en-estado-' + i">
              <p-toggleswitch [inputId]="'en-estado-' + i" [(ngModel)]="f.status" [trueValue]="1" [falseValue]="0" />
              <span>
                {{ f.status === 1 ? 'Disponible' : 'No disponible' }}
                @if (!f.idTicket) {
                  <small>Se crea al guardar</small>
                }
              </span>
            </label>
          </li>
        }
      </ul>
      @if (!valido()) {
        <p class="adm-error">Cada entrada necesita nombre, y precio si está disponible.</p>
      }
      <p class="adm-hint">Para que una entrada no se venda, márcala como no disponible.</p>
    </section>
  `,
  styles: `
    .entradas {
      display: grid;
      gap: 0.75rem;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    li {
      display: grid;
      grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) auto;
      align-items: end;
      gap: 0.75rem 1rem;
      padding: 0.85rem 1rem;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--surface-2);
    }

    .estado {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      min-height: 44px;
      min-width: 9.5rem;
      color: var(--text);
      font-size: 0.88rem;
      cursor: pointer;

      small {
        display: block;
        color: var(--text-subtle);
        font-size: 0.72rem;
      }
    }

    @media (max-width: 560px) {
      li {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      }

      .estado {
        grid-column: 1 / -1;
      }
    }
  `
})
export class EventTicketsComponent {
  private ticketsService = inject(TicketsService);

  /** null al crear: el evento todavía no existe. */
  readonly idEvents = input<number | null>(null);
  readonly category = input<string>('evento');

  readonly filas = signal<Fila[]>([]);
  private readonly existentes = signal<Ticket[]>([]);

  constructor() {
    effect(() => {
      const id = this.idEvents();
      if (!id) return;
      // El backend responde 404 cuando el evento no tiene entradas.
      this.ticketsService
        .getTicktesByEvent(id)
        .pipe(catchError(() => of([] as Ticket[])))
        .subscribe(tickets => {
          this.existentes.set(tickets);
          this.sincronizar();
        });
    });
    effect(() => {
      this.category();
      untracked(() => this.sincronizar());
    });
  }

  /** Las guardadas más las del tipo de evento que todavía no existen. */
  private sincronizar() {
    const tipos = this.category() === 'concierto' ? TIPOS_CONCIERTO : TIPOS_BASE;
    const prev = this.filas();
    const guardadas: Fila[] = this.existentes().map(
      t =>
        prev.find(f => f.idTicket === t.idTicket) ?? {
          idTicket: t.idTicket,
          name: t.name,
          price: Number(t.price),
          status: t.status,
          antes: firma({ name: t.name, price: Number(t.price), status: t.status })
        }
    );
    const nuevas: Fila[] = tipos
      .filter(tipo => !guardadas.some(f => clave(f.name).startsWith(clave(tipo))))
      .map(tipo => prev.find(f => !f.idTicket && f.tipo === tipo) ?? { tipo, name: tipo, price: null, status: 1 });

    const orden = (f: Fila) => {
      const i = TIPOS_CONCIERTO.findIndex(tipo => clave(f.name).startsWith(clave(tipo)));
      return i === -1 ? TIPOS_CONCIERTO.length : i;
    };
    this.filas.set([...guardadas, ...nuevas].sort((a, b) => orden(a) - orden(b)));
  }

  valido(): boolean {
    return this.filas().every(f => f.name?.trim() && (f.status === 0 || (f.price !== null && f.price >= 0)));
  }

  /** Crea las que faltan y actualiza las que cambiaron. */
  guardar(idEvents: number): Observable<unknown> {
    const llamadas = this.filas().flatMap(f => {
      const body = { name: f.name.trim(), price: Number(f.price ?? 0), status: f.status };
      if (!f.idTicket) return [this.ticketsService.createTicket({ ...body, idEvents })];
      return firma(f) !== f.antes ? [this.ticketsService.updateTicket(f.idTicket, body)] : [];
    });
    return llamadas.length ? forkJoin(llamadas) : of([]);
  }
}
