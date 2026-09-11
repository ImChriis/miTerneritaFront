import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-timer',
  imports: [],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss'
})
export class TimerComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private messageService = inject(MessageService);

  readonly maxTimeSecons = 1200;


  // 20 minutos en segundos (20 * 60 = 1200)
  readonly MAX_TIME_SECONDS = 1200; 
  timeLeft = signal<number>(this.MAX_TIME_SECONDS);
  
  private timerSubscription?: Subscription;

  ngOnInit(): void {
    this.startCheckoutTimer();
  }

  private startCheckoutTimer(): void {
    // Emite cada 1 segundo (1000 ms)
    this.timerSubscription = timer(0, 1000).subscribe(() => {
      const current = this.timeLeft();

      if (current > 0) {
        this.timeLeft.set(current - 1);
      } else {
        this.handleTimerExpired();
      }
    });
  }

  private handleTimerExpired(): void {
    // 1. Cancelar la suscripción del temporizador
    this.timerSubscription?.unsubscribe();

    // 2. Limpiar datos guardados del proceso (localStorage, variables, etc.)
    localStorage.removeItem('checkout_data'); 

    // 3. Notificar al usuario
    this.messageService.add({
      severity: 'warn',
      summary: 'Tiempo agotado',
      detail: 'Tu sesión de compra ha expirado. Por favor, selecciona tus entradas nuevamente.'
    });

    // 4. Redirigir al inicio o página del evento
    this.router.navigate(['/']);
  }

  // Formatea los segundos restantes en mm:ss
  get formattedTime(): string {
    const minutes = Math.floor(this.timeLeft() / 60);
    const seconds = this.timeLeft() % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  ngOnDestroy(): void {
    // Siempre desuscribirse al salir del componente para evitar fugas de memoria
    this.timerSubscription?.unsubscribe();
  }

}
