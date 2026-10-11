import { Component, inject, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';

/**
 * - mode="window": loader global. Muestra el splash de marca solo en la primera carga
 *   y una barra de progreso fina en las navegaciones siguientes.
 * - mode="component" (por defecto): spinner en línea para tablas/listas.
 */
@Component({
  selector: 'app-loader',
  imports: [],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private routerSub?: Subscription;
  private doneTimer?: ReturnType<typeof setTimeout>;

  @Input() isLoading: boolean = false;
  @Input() mode: 'window' | 'component' = 'component';

  splash = signal(true);
  navigating = signal(false);

  ngOnInit() {
    if (this.mode === 'window') {
      this.listenToRouter();
    }
  }

  private listenToRouter() {
    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        clearTimeout(this.doneTimer);
        this.navigating.set(true);
      }
      if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        this.doneTimer = setTimeout(() => {
          this.navigating.set(false);
          this.splash.set(false);
        }, this.splash() ? 450 : 200);
      }
    });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
    clearTimeout(this.doneTimer);
  }
}
