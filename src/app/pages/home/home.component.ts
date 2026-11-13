import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, timer } from 'rxjs';
import { EventsService } from '../../@core/services/events.service';
import { TicketsService } from '../../@core/services/tickets.service';
import { Event } from '../../@core/models/event.model';
import {
  byDateAsc,
  CATEGORY_ICON,
  CATEGORY_LABEL,
  EventCategory,
  eventCategory,
  eventImage,
  formatTime12,
  isPastEvent,
  parseEventDate,
  stripHtml
} from '../../@core/utils/event-utils';
import { SpacesGalleryComponent } from '../../shared/components/spaces-gallery/spaces-gallery.component';
import { PartnersMarqueeComponent } from '../../shared/components/partners-marquee/partners-marquee.component';
import { RevealDirective } from '../../shared/directives/reveal.directive';

type CategoryFilter = 'todos' | EventCategory;

const FALLBACK_IMG = 'assets/img/optimized/fondo1.webp';

interface EventView extends Event {
  day: Date;
  category: EventCategory;
  categoryLabel: string;
  categoryIcon: string;
  timeLabel: string;
  excerpt: string;
  flyerUrl: string;
  bannerUrl: string;
  minPrice: number | null;
}

import { CapFirstPipe } from '../../shared/pipes/cap-first.pipe';

@Component({
  selector: 'app-home',
  imports: [CapFirstPipe, DatePipe, DecimalPipe, RouterLink, RevealDirective, SpacesGalleryComponent, PartnersMarqueeComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private eventService = inject(EventsService);
  private ticketsService = inject(TicketsService);

  /** Personas pagando ahora por evento; se refresca cada 30 s. */
  readonly comprando = toSignal(
    timer(0, 30_000).pipe(switchMap(() => this.eventService.comprando().pipe(catchError(() => of({} as Record<number, number>))))),
    { initialValue: {} as Record<number, number> }
  );

  /** Eventos agotados: sus botones de compra dicen SOLD OUT. */
  private readonly agotados = toSignal(this.eventService.agotados().pipe(catchError(() => of([] as number[]))), {
    initialValue: [] as number[]
  });
  agotado(id: number) {
    return this.agotados().includes(id);
  }

  readonly skeletons = [0, 1, 2, 3, 4];

  private raw = signal<Event[]>([]);
  private prices = signal<Map<number, number>>(new Map());
  loading = signal(true);

  // ---------- Listas derivadas ----------
  private all = computed<EventView[]>(() =>
    this.raw()
      .filter(e => e.status === 1)
      .map(e => this.toView(e))
  );

  upcoming = computed(() => this.all().filter(e => !isPastEvent(e)).sort(byDateAsc));
  past = computed(() =>
    this.all()
      .filter(e => isPastEvent(e))
      .sort((a, b) => byDateAsc(b, a))
      .slice(0, 12)
  );
  concerts = computed(() => this.upcoming().filter(e => e.category === 'concierto'));
  /** El primero va destacado con el mapa del salón; estos son los siguientes. */
  otherConcerts = computed(() => this.concerts().slice(1));
  heroSlides = computed(() => this.upcoming().slice(0, 6));

  // ---------- Filtros ----------
  query = signal('');
  category = signal<CategoryFilter>('todos');
  categories = computed(() => {
    const present = new Set(this.upcoming().map(e => e.category));
    return (['concierto', 'fiesta', 'evento'] as EventCategory[])
      .filter(c => present.has(c))
      .map(c => ({ value: c, label: CATEGORY_LABEL[c], icon: CATEGORY_ICON[c] }));
  });
  filtered = computed(() => {
    const q = this.normalize(this.query());
    const cat = this.category();
    return this.upcoming().filter(
      e =>
        (cat === 'todos' || e.category === cat) &&
        (!q || this.normalize(`${e.name} ${e.room} ${e.excerpt}`).includes(q))
    );
  });

  // ---------- Hero ----------
  slide = signal(0);
  heroPaused = signal(false);
  readonly autoplay = typeof matchMedia === 'undefined' || !matchMedia('(prefers-reduced-motion: reduce)').matches;
  private touchX: number | null = null;

  // ---------- Tarjetas ampliables ----------
  /** null = primera tarjeta abierta por defecto; -1 = todas cerradas (acordeón móvil). */
  activeId = signal<number | null>(null);
  activeEvent = computed(() => {
    const list = this.filtered();
    const id = this.activeId();
    return list.find(e => e.idEvents === id) ?? (id === null ? list[0] ?? null : null);
  });

  private eventsSection = viewChild<ElementRef<HTMLElement>>('eventsSection');
  private pastScroller = viewChild<ElementRef<HTMLElement>>('pastScroller');
  private concertScroller = viewChild<ElementRef<HTMLElement>>('concertScroller');

  ngOnInit() {
    this.eventService.getEvents().subscribe({
      next: events => {
        this.raw.set(events ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false)
    });

    // Precio "desde" de cada evento
    this.ticketsService.getTickets().subscribe(tickets => {
      const map = new Map<number, number>();
      for (const t of tickets ?? []) {
        if (t.status !== 1) continue;
        const price = Number(t.price);
        if (Number.isNaN(price)) continue;
        map.set(t.idEvents, Math.min(map.get(t.idEvents) ?? Infinity, price));
      }
      this.prices.set(map);
    });
  }

  // ---------- Hero ----------
  goToSlide(i: number) {
    const total = this.heroSlides().length;
    if (!total) return;
    this.slide.set((i + total) % total);
  }

  nextSlide() {
    this.goToSlide(this.slide() + 1);
  }

  prevSlide() {
    this.goToSlide(this.slide() - 1);
  }

  /** El avance automático lo marca el final de la animación de la barra de progreso. */
  onProgressEnd() {
    if (this.autoplay && this.heroSlides().length > 1) this.nextSlide();
  }

  onTouchStart(e: TouchEvent) {
    this.touchX = e.touches[0]?.clientX ?? null;
  }

  onTouchEnd(e: TouchEvent) {
    if (this.touchX === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? this.touchX) - this.touchX;
    if (Math.abs(dx) > 50) dx < 0 ? this.nextSlide() : this.prevSlide();
    this.touchX = null;
  }

  // ---------- Filtros ----------
  setCategory(c: CategoryFilter) {
    this.category.set(c);
    this.activeId.set(null);
  }

  onSearch(value: string) {
    this.query.set(value);
    this.activeId.set(null);
  }

  submitSearch(event: SubmitEvent) {
    event.preventDefault();
    this.eventsSection()?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  clearFilters() {
    this.query.set('');
    this.category.set('todos');
  }

  // ---------- Tarjetas ----------
  expand(ev: EventView, el?: HTMLElement) {
    this.activeId.set(ev.idEvents);
    // En móvil el acordeón cambia de alto: mantenemos la tarjeta a la vista
    if (el && typeof window !== 'undefined' && window.innerWidth < 900) {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 380);
    }
  }

  scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  scrollRow(which: 'past' | 'concerts', dir: 1 | -1) {
    const el = (which === 'past' ? this.pastScroller() : this.concertScroller())?.nativeElement;
    el?.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  }

  goToEvent(id: number) {
    this.router.navigate(['/home/event', id]);
  }

  buy(id: number) {
    this.router.navigate(['/home/event', id, 'ticket']);
  }

  private toView(e: Event): EventView {
    const category = eventCategory(e);
    return {
      ...e,
      day: parseEventDate(e.date),
      category,
      categoryLabel: CATEGORY_LABEL[category],
      categoryIcon: CATEGORY_ICON[category],
      timeLabel: formatTime12(e.time),
      excerpt: stripHtml(e.description ?? ''),
      flyerUrl: eventImage(e.flyer || e.image1 || e.image3) || FALLBACK_IMG,
      bannerUrl: eventImage(e.image3 || e.image1 || e.flyer) || FALLBACK_IMG,
      minPrice: this.prices().get(e.idEvents) ?? null
    };
  }

  private normalize(s: string) {
    return s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .trim();
  }
}
