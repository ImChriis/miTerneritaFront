import { Component } from '@angular/core';
import { SPACES } from '../../../@core/data/site';
import { RevealDirective } from '../../directives/reveal.directive';

/** Galería tipo bento "Conoce nuestros espacios". Las fotos se editan en @core/data/site.ts */
@Component({
  selector: 'app-spaces-gallery',
  imports: [RevealDirective],
  templateUrl: './spaces-gallery.component.html',
  styleUrl: './spaces-gallery.component.scss'
})
export class SpacesGalleryComponent {
  readonly spaces = SPACES;
}
