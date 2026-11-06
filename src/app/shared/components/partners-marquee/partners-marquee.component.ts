import { Component } from '@angular/core';
import { PARTNERS } from '../../../@core/data/site';

/**
 * Carrusel infinito de logos con fondo blanco.
 * Los logos se agregan en PARTNERS (@core/data/site.ts).
 */
@Component({
  selector: 'app-partners-marquee',
  templateUrl: './partners-marquee.component.html',
  styleUrl: './partners-marquee.component.scss'
})
export class PartnersMarqueeComponent {
  // Con pocos logos una sola vuelta no llena pantallas anchas: se repite la lista.
  readonly partners = Array.from({ length: Math.ceil(12 / PARTNERS.length) }, () => PARTNERS).flat();
}
