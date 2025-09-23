import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EventsService } from '../../core/services/events.service';
import { Observable } from 'rxjs';
import { Event } from '../../core/models/event.model';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  private router = inject(Router);
  private eventService = inject(EventsService);
  events$!: Observable<Event[]>

  @ViewChild('eventsGrid') eventsSection!: ElementRef;
  @ViewChild('zones') zonesSection!: ElementRef;
  @ViewChild('zones2') zonesSection2!: ElementRef;

  goToEvent() {
    this.router.navigate(['/home/event']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    console.log("click")
  }

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

  private intervalId: any;

  ngOnInit() {
  this.intervalId = setInterval(() => {
    this.nextSlide();
  }, 3500); // Cambia cada 3.5 segundos

  this.events$ = this.eventService.getEvents();
  this.events$.subscribe(events => {
    console.log(events);
  })

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

currentSlideIndex = 0;

prevSlide() {
  this.currentSlideIndex =
    (this.currentSlideIndex - 1 + this.testEvents.length) % this.testEvents.length;
}

nextSlide() {
  this.currentSlideIndex =
    (this.currentSlideIndex + 1) % this.testEvents.length;
}

  formatTime(time: string): string {
    if (!time) return '';
  
    // Divide la hora en partes (HH:mm:ss)
    const [hours, minutes, seconds] = time.split(':').map(Number);
  
    // Determina AM o PM
    const ampm = hours >= 12 ? 'PM' : 'AM';
  
    // Convierte a formato de 12 horas
    const formattedHours = hours % 12 || 12; // La hora 0 debe ser 12
  
    // Formatea los minutos con dos dígitos
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
  
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  }

navigateToEvent(idEvento: number){
  this.router.navigate(['/home/event/', idEvento]).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
}
