import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { ADDRESS, SeoService } from '../../@core/services/seo.service';
import { AuthService } from '../../@core/services/auth.service';
import { puedeVerPanel } from '../../@core/auth/roles';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { catchError, of } from 'rxjs';
import { EventsService } from '../../@core/services/events.service';
import { TicketsService } from '../../@core/services/tickets.service';
import { Event, EventPhoto } from '../../@core/models/event.model';
import { EventGalleryComponent } from '../../shared/components/event-gallery/event-gallery.component';
import { Ticket } from '../../@core/models/ticket.model';
import { VENUE } from '../../@core/data/site';
import {
  CATEGORY_ICON,
  CATEGORY_LABEL,
  eventCategory,
  eventImage,
  formatTime12,
  isPastEvent,
  parseEventDate,
  stripHtml
} from '../../@core/utils/event-utils';

import { CapFirstPipe } from '../../shared/pipes/cap-first.pipe';

@Component({
  selector: 'app-event',
  imports: [CapFirstPipe, DatePipe, DecimalPipe, EventGalleryComponent, RouterLink],
  templateUrl: './event.component.html',
  styleUrl: './event.component.scss'
})
export class EventComponent implements OnInit {
  private eventsService = inject(EventsService);
  private ticketsService = inject(TicketsService);
  private messageService = inject(MessageService);
  private sanitizer = inject(DomSanitizer);
  private seo = inject(SeoService);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly venue = VENUE;
  readonly mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(VENUE.mapsEmbed);

  event = signal<Event | null>(null);
  tickets = signal<Ticket[]>([]);
  /** Galería "revive tu noche" (la sube el admin después del evento). */
  fotos = signal<EventPhoto[]>([]);
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

  constructor() {
    // Vista previa al compartir y ficha de evento para Google (con precios cuando cargan las entradas).
    effect(() => {
      const ev = this.event();
      if (!ev) return;
      const prices = this.tickets().map(t => Number(t.price)).filter(p => !Number.isNaN(p));
      const fecha = this.day().toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' });
      const resumen = stripHtml(ev.description ?? '');
      const description = `${ev.name}: ${fecha}, ${this.time()} en Mi Ternerita House, Maracaibo.${resumen ? ' ' + resumen : ' Compra tus entradas en línea.'}`;
      const image = this.seo.absolute(this.flyer());
      const origin = location.origin;
      this.seo.update({
        title: ev.name,
        description,
        image,
        type: 'article',
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': this.category() === 'concierto' ? 'MusicEvent' : 'Event',
          name: ev.name,
          description: description.slice(0, 300),
          startDate: `${String(ev.date).slice(0, 10)}T${(ev.time || '00:00:00').slice(0, 8)}-04:00`,
          eventStatus: 'https://schema.org/EventScheduled',
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          image: [image],
          location: { '@type': 'Place', name: VENUE.name, address: ADDRESS },
          organizer: { '@type': 'Organization', name: VENUE.name, url: origin + '/' },
          ...(prices.length && !this.isPast()
            ? {
                offers: {
                  '@type': 'AggregateOffer',
                  priceCurrency: 'USD',
                  lowPrice: Math.min(...prices),
                  highPrice: Math.max(...prices),
                  offerCount: prices.length,
                  availability: 'https://schema.org/InStock',
                  url: `${origin}/home/event/${ev.idEvents}`
                }
              }
            : {})
        }
      });
    });
  }

  /** SOLD OUT: el evento ya vendió todo su aforo. */
  readonly agotado = signal(false);
  /** Cupo restante: solo se pide y se muestra al personal (admin y user). */
  readonly cupo = signal<{ restantes: number; capacidad: number; apartadas: number } | null>(null);

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
        this.loading.set(false);
      },
      error: () => {
        this.seo.update({ title: 'Evento no encontrado', noindex: true });
        this.notFound.set(true);
        this.loading.set(false);
      }
    });

    this.fotos.set([]);
    this.agotado.set(false);
    this.cupo.set(null);
    this.eventsService
      .agotados()
      .pipe(catchError(() => of([] as number[])))
      .subscribe(ids => this.agotado.set(ids.includes(id)));
    if (puedeVerPanel(this.auth.getUser()?.role)) {
      this.eventsService
        .disponibles()
        .pipe(catchError(() => of({} as Record<number, { capacidad: number; vendidas: number; apartadas: number }>)))
        .subscribe(cupos => {
          const c = cupos[id];
          if (c) this.cupo.set({ capacidad: c.capacidad, apartadas: c.apartadas, restantes: Math.max(c.capacidad - c.vendidas - c.apartadas, 0) });
        });
    }
    this.eventsService
      .getPhotos(id)
      .pipe(catchError(() => of([] as EventPhoto[])))
      .subscribe(fotos => this.fotos.set(fotos));

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
