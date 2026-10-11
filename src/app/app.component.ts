import { ViewportScroller } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { LoaderComponent } from './@core/components/loader/loader.component';
import { ThemeService } from './@core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ToastModule,
    LoaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  // Se inyecta aquí para que el tema quede sincronizado desde el arranque.
  private theme = inject(ThemeService);

  constructor() {
    // Compensa la barra de navegación fija al saltar a un #ancla (p. ej. /#eventos).
    inject(ViewportScroller).setOffset([0, 88]);
  }
}
