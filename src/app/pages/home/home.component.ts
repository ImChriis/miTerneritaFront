import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EventsService } from '../../@core/services/events.service';
import { map, Observable, tap } from 'rxjs';
import { Event } from '../../@core/models/event.model';
import { environment } from '../../../environments/environment.developer';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    // RouterLink
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  private router = inject(Router);
  private eventService = inject(EventsService);
  private intervalId: any;
  events$!: Observable<Event[]>;
  slideIndex = signal(0);
  selectedIndex = 0;
  apiImg = environment.apiImg;
  eventsLoaded: Event[] = [];

  @ViewChild('eventsGrid') eventsSection!: ElementRef;
  @ViewChild('zones') zonesSection!: ElementRef;
  @ViewChild('zones2') zonesSection2!: ElementRef;

  ngAfterViewInit() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        }
      });
    }, { threshold: 0.2 });

    if (this.eventsSection && this.eventsSection.nativeElement) {
      observer.observe(this.eventsSection.nativeElement);
    }

    if (this.zonesSection && this.zonesSection.nativeElement) {
      observer.observe(this.zonesSection.nativeElement);
    }

    if (this.zonesSection2 && this.zonesSection2.nativeElement) {
      observer.observe(this.zonesSection2.nativeElement);
    }
  }

ngOnInit() {
  this.intervalId = setInterval(() => {
    this.nextSlide();
  }, 3500);

  this.events$ = this.eventService.getEvents().pipe(
    map(events => events.filter((event: Event) => event.status === 1)),
    tap(events => this.eventsLoaded = events)
  )
}

  selectEvent(index: number){
    this.selectedIndex = index;
  }

  get selectedBackground(): string {
    // Prefer events loaded from the service; fall back to local sample `testEvents` if none loaded
    const ev = (this.eventsLoaded && this.eventsLoaded.length > 0)
      ? (this.eventsLoaded[this.selectedIndex] as any)
      : (this.testEvents && this.testEvents.length > 0)
        ? (this.testEvents[this.selectedIndex] as any)
        : undefined;
    if (!ev) {
      return '';
    }

    // Prefer image1 property when available (comes from backend model)
    const candidate = (ev as any).image1 ?? (ev as any).foto ?? (ev as any).fondo ?? (ev as any).image ?? (ev as any).imagen ?? (ev as any).flyer;
    if (!candidate) return '';

    const full = this.getFullUrl(candidate);
    return `url('${full}')`;
  }

  private getFullUrl(path: string): string {
    if (!path) return '';
    // If it's already an absolute URL, return as-is
    if (/^https?:\/\//i.test(path)) return path;
    // If it's an assets path (starts with assets or /), return as-is
    if (/^(assets\/|\/)/.test(path)) return path;
    // Otherwise assume it's a server-stored image and prefix with apiImg
    return `${this.apiImg}/${path}`;
  }

ngOnDestroy() {
  if (this.intervalId) {
    clearInterval(this.intervalId);
  }
}

  testEvents = [
    {
      nombre: 'Evento 1',
      descripcion: 'Descripción del evento 1',
      imagen: '../../../assets/img/zona1.jpg'
    },
    {
      nombre: 'Evento 2',
      descripcion: 'Descripción del evento 2',
      imagen: '../../../assets/img/zona2.jpg'
    },
    {
      nombre: 'Evento 3',
      descripcion: 'Descripción del evento 3',
      imagen: '../../../assets/img/zona3.jpg'
    }
  ];


  nextSlide() {
    this.slideIndex.update(i => (i + 1 + this.testEvents.length) % this.testEvents.length);
  }

  prevSlide() {
    if (this.testEvents.length > 0) {
      this.slideIndex.update(i => (i - 1 + this.testEvents.length) % this.testEvents.length);
    }
  }


  formatTime(time: string): string {
    if (!time) return '';
  
    const [hours, minutes, seconds] = time.split(':').map(Number);
  
    const ampm = hours >= 12 ? 'PM' : 'AM';
  
    const formattedHours = hours % 12 || 12;
  
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
  
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  }

  navigateToEvent(idEvento: number){
    this.router.navigate(['/home/event/', idEvento]).then(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  }

  goToEvent(idEvent: number){
    this.router.navigate(['/home/event/', idEvent]).then(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
