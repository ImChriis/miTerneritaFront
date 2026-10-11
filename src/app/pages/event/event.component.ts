import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { catchError, of } from 'rxjs';
import { EventsService } from '../../@core/services/events.service';
import { TicketsService } from '../../@core/services/tickets.service';
import { Event } from '../../@core/models/event.model';
import { Ticket } from '../../@core/models/ticket.model';
import { VENUE } from '../../@core/data/site';
import {
  CATEGORY_ICON,
  CATEGORY_LABEL,
  eventCategory,
  eventImage,
  formatTime12,
  isPastEvent,
  parseEventDate
} from '../../@core/utils/event-utils';

import { CapFirstPipe } from '../../shared/pipes/cap-first.pipe';

@Component({
  selector: 'app-event',
  imports: [CapFirstPipe, DatePipe, DecimalPipe, RouterLink],
  templateUrl: './event.component.html',
  styleUrl: './event.component.scss'
})
export class EventComponent implements OnInit {
  private eventsService = inject(EventsService);
  private ticketsService = inject(TicketsService);
  private messageService = inject(MessageService);
  private sanitizer = inject(DomSanitizer);
  private title = inject(Title);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly venue = VENUE;
  readonly mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(VENUE.mapsEmbed);

  event = signal<Event | null>(null);
  tickets = signal<Ticket[]>([]);
  loading = signal(true);
  notFound = signal(false);

  day = computed(() => parseEventDate(this.event()?.date));
  time = computed(() => formatTime12(this.event()?.time));
  isPast = computed(() => !!this.event() && isPastEvent(this.event()!));
  category = computed(() => (this.event() ? eventCategory(this.event()!) : 'evento'));
  categoryLabel = computed(() => CATEGORY_LABEL[this.category()]);
  categoryIcon = computed(() => CATEGORY_ICON[this.category()]);
  flyer = computed(() => eventImage(this.event()?.flyer || this.event()?.image1) || 'assets/img/optimized/fondo1.webp');
  backdrop = computed(() => eventImage(this.event()?.image1 || this.event()?.image3 || this.event()?.flyer) || this.flyer());
  minPrice = computed(() => {
    const prices = this.tickets().map(t => Number(t.price)).filter(p => !Number.isNaN(p));
    return prices.length ? Math.min(...prices) : null;
  });

  ngOnInit() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const id = Number(params.get('id'));
      this.load(id);
    });
  }

  private load(id: number) {
    this.loading.set(true);
    this.notFound.set(false);
    this.tickets.set([]);

    this.eventsService.getEventById(id).subscribe({
      next: event => {
        this.event.set(event);
        this.title.setTitle(`${event.name} · Mi Ternerita House`);
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      }
    });

    this.ticketsService
      .getTicktesByEvent(id)
      .pipe(catchError(() => of([] as Ticket[])))
      .subscribe(tickets => this.tickets.set((tickets ?? []).filter(t => t.status === 1)));
  }

  price(t: Ticket) {
    return Number(t.price);
  }

  goToEventTicket(idEvents: number) {
    this.router.navigate(['/home/event', idEvents, 'ticket']);
  }

  async share() {
    const ev = this.event();
    const url = window.location.href;
    const data = { title: ev?.name ?? 'Mi Ternerita House', text: `¡Vamos a ${ev?.name}!`, url };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(url);
      this.messageService.add({ severity: 'success', summary: 'Enlace copiado', detail: 'Compártelo con tus amigos.' });
    } catch {
      // el usuario canceló el diálogo de compartir
    }
  }
}
