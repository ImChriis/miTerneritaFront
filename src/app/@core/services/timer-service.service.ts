import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { timer } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';

@Injectable({
  providedIn: 'root'
})
export class TimerServiceService {
private router = inject(Router);

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

  startTimer(): void {
    // Si ya está corriendo, no lo reiniciamos
    if (this.isRunning()) return;

    this.stopTimer();
    this.timeLeft.set(this.DURATION_SECONDS);
    this.isRunning.set(true);

    this.timerSub = timer(0, 1000).subscribe(() => {
      const current = this.timeLeft();
      if (current > 0) {
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
    this.resetCheckout();
    localStorage.removeItem('checkout_data'); // Limpia tu almacenamiento
    alert('Tu sesión de compra ha expirado. Por favor, selecciona tus entradas nuevamente.');
    this.router.navigate(['/home']);
  }
}
