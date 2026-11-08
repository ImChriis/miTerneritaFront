import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { forkJoin, startWith, switchMap } from 'rxjs';
import { TicketsService } from '../../@core/services/tickets.service';
import { EventsService } from '../../@core/services/events.service';
import { Ticket } from '../../@core/models/ticket.model';
import { Event } from '../../@core/models/event.model';
import { parseEventDate } from '../../@core/utils/event-utils';
import { CreateTicketsComponent } from './components/create-tickets/create-tickets.component';
import { UpdateTicketsComponent } from './components/update-tickets/update-tickets.component';
import { ConfirmDeleteModalComponent } from '../../shared/components/confirm-delete-modal/confirm-delete-modal.component';
import { LoaderComponent } from '../../@core/components/loader/loader.component';

/** Orden de los tipos conocidos; el resto va después, por nombre. */
const ORDEN_TIPOS = ['general', 'vip', 'palco a', 'palco b'];
const clave = (texto: string) => (texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

interface Fila {
  ticket: Ticket;
  evento: string;
  fecha: Date | null;
}

interface Grupo {
  clave: string;
  nombre: string;
  filas: Fila[];
  disponibles: number;
}

/**
 * Entradas agrupadas por tipo (General, VIP, Palco A...). Dentro de cada tipo,
 * los eventos que la tienen con su precio y si está a la venta.
 */
@Component({
  selector: 'app-tickets',
  imports: [DatePipe, DecimalPipe, FormsModule, LoaderComponent],
  templateUrl: './tickets.component.html',
  styleUrl: './tickets.component.scss'
})
export class TicketsComponent {
  private ticketsService = inject(TicketsService);
  private eventsService = inject(EventsService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  ref: DynamicDialogRef | undefined;

  private tickets = toSignal(
    this.ticketsService.refreshTicketsObservable$.pipe(
      startWith(null),
      switchMap(() => this.ticketsService.getTickets())
    ),
    { initialValue: null }
  );
  private eventos = toSignal(this.eventsService.getEvents(), { initialValue: [] as Event[] });

  busqueda = signal('');
  cerrados = signal(new Set<string>());
  /** Clave del grupo que se está renombrando. */
  renombrando = signal<string | null>(null);
  nuevoNombre = '';
  private renombre = viewChild<ElementRef<HTMLInputElement>>('renombre');

  cargando = computed(() => this.tickets() === null);

  grupos = computed<Grupo[]>(() => {
    const eventos = new Map(this.eventos().map(e => [e.idEvents, e]));
    const q = clave(this.busqueda());
    const grupos = new Map<string, Grupo>();

    for (const ticket of this.tickets() ?? []) {
      const ev = eventos.get(ticket.idEvents);
      const fila: Fila = { ticket, evento: ev?.name ?? 'Sin evento', fecha: ev ? parseEventDate(ev.date) : null };
      if (q && !clave(`${ticket.name} ${fila.evento}`).includes(q)) continue;

      const k = clave(ticket.name);
      const grupo = grupos.get(k) ?? { clave: k, nombre: ticket.name, filas: [], disponibles: 0 };
      grupo.filas.push(fila);
      if (ticket.status === 1) grupo.disponibles++;
      grupos.set(k, grupo);
    }

    const orden = (k: string) => (ORDEN_TIPOS.includes(k) ? ORDEN_TIPOS.indexOf(k) : ORDEN_TIPOS.length);
    // Dentro de cada tipo, el evento más reciente primero.
    for (const g of grupos.values()) g.filas.sort((a, b) => (b.fecha?.getTime() ?? 0) - (a.fecha?.getTime() ?? 0));
    return [...grupos.values()].sort((a, b) => orden(a.clave) - orden(b.clave) || a.nombre.localeCompare(b.nombre));
  });

  alternarGrupo(k: string) {
    const cerrados = new Set(this.cerrados());
    cerrados.has(k) ? cerrados.delete(k) : cerrados.add(k);
    this.cerrados.set(cerrados);
  }

  /** Todas a la venta si alguna no lo está; si ya lo están todas, ninguna. */
  alternarDisponible(grupo: Grupo) {
    const status = grupo.disponibles === grupo.filas.length ? 0 : 1;
    this.actualizarGrupo(grupo, { status }, status ? `${grupo.nombre} a la venta en todos sus eventos` : `${grupo.nombre} retirada de la venta`);
  }

  empezarRenombre(grupo: Grupo) {
    this.nuevoNombre = grupo.nombre;
    this.renombrando.set(grupo.clave);
    // El input aparece en el siguiente ciclo de render.
    setTimeout(() => this.renombre()?.nativeElement.select());
  }

  guardarNombre(grupo: Grupo) {
    // Enter quita el input y eso dispara blur: solo cuenta la primera llamada.
    if (this.renombrando() !== grupo.clave) return;
    const name = this.nuevoNombre.trim();
    this.renombrando.set(null);
    if (!name || name === grupo.nombre) return;
    this.actualizarGrupo(grupo, { name }, `Ahora se llama ${name}`);
  }

  private actualizarGrupo(grupo: Grupo, cambios: Partial<Pick<Ticket, 'name' | 'status'>>, ok: string) {
    forkJoin(grupo.filas.map(f => this.ticketsService.updateTicket(f.ticket.idTicket, cambios))).subscribe({
      next: () => this.messageService.add({ severity: 'success', summary: 'Entradas', detail: ok }),
      error: err => this.messageService.add({ severity: 'error', summary: 'Entradas', detail: err?.error?.message ?? 'No se pudieron actualizar' })
    });
  }

  openCreateModal() {
    this.ref = this.dialogService.open(CreateTicketsComponent, {
      header: 'Nueva entrada',
      width: '520px',
      modal: true,
      closable: true,
      breakpoints: { '960px': '94vw' }
    });
  }

  openEditModal(ticket: Ticket) {
    this.ref = this.dialogService.open(UpdateTicketsComponent, {
      header: 'Editar entrada',
      width: '520px',
      modal: true,
      closable: true,
      data: { ticket },
      breakpoints: { '960px': '94vw' }
    });
  }

  eliminarGrupo(grupo: Grupo) {
    this.showConfirmModal(grupo.filas.map(f => f.ticket), grupo.nombre);
  }

  /** Borra una entrada o todas las de un tipo. Las que ya tienen ventas no se borran. */
  showConfirmModal(tickets: Ticket[], nombre: string) {
    this.ref = this.dialogService.open(ConfirmDeleteModalComponent, {
      header: 'Confirmar eliminación',
      width: '40vw',
      modal: true,
      breakpoints: { '960px': '94vw' },
      data: {
        message:
          tickets.length === 1
            ? `¿Eliminar la entrada ${nombre}?`
            : `¿Eliminar ${nombre} de sus ${tickets.length} eventos? Las que ya tienen ventas se conservan.`,
        selectedItems: tickets
      }
    });

    this.ref.onClose.subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      for (const t of tickets) {
        this.ticketsService.deleteTicket(t.idTicket).subscribe({
          next: () => this.messageService.add({ severity: 'success', summary: 'Éxito', detail: `${t.name} eliminada` }),
          error: err => this.messageService.add({ severity: 'error', summary: 'No se eliminó', detail: err?.error?.message ?? 'Ocurrió un error al eliminar la entrada' })
        });
      }
    });
  }
}
