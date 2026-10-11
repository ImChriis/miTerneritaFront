import { computed, inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { filter, timer } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';

/** Rutas del flujo de compra: /home/event/:id/ticket[/...] */
const PURCHASE_FLOW = /^\/home\/event\/\d+\/ticket/;

@Injectable({
  providedIn: 'root'
})
export class TimerServiceService {
  private router = inject(Router);
  private messageService = inject(MessageService);

  readonly DURATION_SECONDS = 1200; // 20 minutos (20 * 60)
  timeLeft = signal<number>(this.DURATION_SECONDS);
  isRunning = signal<boolean>(false);

  private timerSub?: Subscription;

  // Signal computada para dar formato mm:ss en el HTML
  formattedTime = computed(() => {
    const total = this.timeLeft();
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  /** 0..1 — fracción de tiempo restante (para la barra del temporizador). */
  progress = computed(() => this.timeLeft() / this.DURATION_SECONDS);

  constructor() {
    // Si el usuario sale del flujo de compra, el temporizador se descarta.
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(e => {
      if (!PURCHASE_FLOW.test((e as NavigationEnd).urlAfterRedirects)) this.resetCheckout();
    });
  }

  startTimer(): void {
    // Si ya está corriendo, no lo reiniciamos (se mantiene entre páginas del flujo)
    if (this.isRunning()) return;

    this.stopTimer();
    this.timeLeft.set(this.DURATION_SECONDS);
    this.isRunning.set(true);

    this.timerSub = timer(1000, 1000).subscribe(() => {
      const current = this.timeLeft();
      if (current > 1) {
        this.timeLeft.set(current - 1);
      } else {
        this.handleExpired();
      }
    });
  }

  stopTimer(): void {
    this.timerSub?.unsubscribe();
    this.isRunning.set(false);
  }

  resetCheckout(): void {
    this.stopTimer();
    this.timeLeft.set(this.DURATION_SECONDS);
  }

  private handleExpired(): void {
    const match = this.router.url.match(/^\/home\/event\/(\d+)/);
    this.resetCheckout();
    localStorage.removeItem('checkout_data'); // Limpia tu almacenamiento
    this.messageService.add({
      severity: 'warn',
      summary: 'Tiempo agotado',
      detail: 'Tu sesión de compra expiró. Selecciona tus entradas nuevamente.',
      life: 6000
    });
    this.router.navigate(match ? ['/home/event', match[1]] : ['/']);
  }
}
