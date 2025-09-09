import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  private intervalId: any;

  ngOnInit() {
  this.intervalId = setInterval(() => {
    this.nextSlide();
  }, 3500); // Cambia cada 3.5 segundos
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
    imagen: '../../../assets/img/foto3.jpg'
  },
  {
    nombre: 'Evento 2',
    descripcion: 'Descripción del evento 2',
    imagen: '../../../assets/img/foto3.jpg'
  },
  {
    nombre: 'Evento 3',
    descripcion: 'Descripción del evento 3',
    imagen: '../../../assets/img/foto4.jpg'
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
}
