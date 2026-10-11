import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { catchError, of } from 'rxjs';
import { TicketsService } from '../../@core/services/tickets.service';
import { Ticket } from '../../@core/models/ticket.model';
import { Event } from '../../@core/models/event.model';
import { EventsService } from '../../@core/services/events.service';
import { eventImage, formatTime12, parseEventDate } from '../../@core/utils/event-utils';
import { PurchaseStepsComponent } from '../../shared/components/purchase-steps/purchase-steps.component';
import { VenueMapComponent, VenueZone } from '../../shared/components/venue-map/venue-map.component';

/** Máximo de entradas por compra */
const MAX_TICKETS = 10;

import { CapFirstPipe } from '../../shared/pipes/cap-first.pipe';

@Component({
  selector: 'app-ticket',
  imports: [CapFirstPipe, DatePipe, DecimalPipe, PurchaseStepsComponent, VenueMapComponent],
  templateUrl: './ticket.component.html',
  styleUrl: './ticket.component.scss'
})
export class TicketComponent implements OnInit {
  private ticketService = inject(TicketsService);
  private messageService = inject(MessageService);
  private eventsService = inject(EventsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly max = MAX_TICKETS;
  idEvent!: number;

  event = signal<Event | null>(null);
  zones = signal<Ticket[]>([]);
  loading = signal(true);
  quantities = signal<Record<number, number>>({});
  activeZone = signal<number | null>(null);

  day = computed(() => parseEventDate(this.event()?.date));
  time = computed(() => formatTime12(this.event()?.time));
  flyer = computed(() => eventImage(this.event()?.flyer || this.event()?.image1) || 'assets/img/optimized/fondo1.webp');
  backdrop = computed(() => eventImage(this.event()?.image3 || this.event()?.image1) || this.flyer());

  count = computed(() => Object.values(this.quantities()).reduce((acc, n) => acc + n, 0));

  /** Mismo formato que esperan checkout y payment: { id, name, cantidad, total } */
  selected = computed(() =>
    this.zones()
      .filter(z => (this.quantities()[z.idTicket] ?? 0) > 0)
      .map(z => {
        const cantidad = this.quantities()[z.idTicket];
        return { id: z.idTicket, name: z.name, cantidad, total: cantidad * Number(z.price) };
      })
  );

  total = computed(() => this.selected().reduce((acc, item) => acc + item.total, 0));

  mapZones = computed<VenueZone[]>(() =>
    this.zones().map(z => ({
      id: z.idTicket,
      name: z.name,
      price: Number(z.price),
      qty: this.quantities()[z.idTicket] ?? 0
    }))
  );

  ngOnInit() {
    this.idEvent = Number(this.route.snapshot.paramMap.get('id'));

    this.ticketService
      .getTicktesByEvent(this.idEvent)
      .pipe(catchError(() => of([] as Ticket[])))
      .subscribe(tickets => {
        this.zones.set((tickets ?? []).filter(t => t.status === 1));
        this.loading.set(false);
      });

    this.eventsService.getEventById(this.idEvent).subscribe({
      next: event => this.event.set(event)
    });
  }

  qty(zone: Ticket) {
    return this.quantities()[zone.idTicket] ?? 0;
  }

  price(zone: Ticket) {
    return Number(zone.price);
  }

  increment(zone: Ticket) {
    if (this.count() >= MAX_TICKETS) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Límite alcanzado',
        detail: `Puedes comprar hasta ${MAX_TICKETS} entradas por compra.`
      });
      return;
    }
    this.activeZone.set(zone.idTicket);
    this.quantities.update(q => ({ ...q, [zone.idTicket]: (q[zone.idTicket] ?? 0) + 1 }));
  }

  decrement(zone: Ticket) {
    this.activeZone.set(zone.idTicket);
    this.quantities.update(q => ({ ...q, [zone.idTicket]: Math.max((q[zone.idTicket] ?? 0) - 1, 0) }));
  }

  clearSelection(id: number): void {
    this.quantities.update(q => ({ ...q, [id]: 0 }));
  }

  /** Clic en una zona del plano: la resalta y agrega una entrada si aún no tiene. */
  onPick(id: number) {
    this.activeZone.set(id);
    const zone = this.zones().find(z => z.idTicket === id);
    if (zone && this.qty(zone) === 0) this.increment(zone);
    document.getElementById(`zone-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  goToCheckout() {
    if (this.selected().length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Elige tus entradas',
        detail: 'Debes seleccionar al menos una entrada antes de continuar.'
      });
      return;
    }

    this.router.navigate(['home/event/', this.idEvent, 'ticket', 'checkout'], {
      state: { selected: this.selected() }
    });
  }
}
