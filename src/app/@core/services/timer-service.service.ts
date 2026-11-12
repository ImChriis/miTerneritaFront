import { computed, inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { filter, timer } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';

/** Rutas del flujo de compra: /home/event/:id/ticket[/...] y /concierto */
const PURCHASE_FLOW = /^\/(home\/event\/\d+\/ticket|concierto)/;

/** Hora límite guardada: recargar la página (F5) no reinicia el tiempo. */
const DEADLINE_KEY = 'checkout_deadline';

/** Paso de la compra en curso (url + history.state) para retomarla si el cliente sale. */
const COMPRA_KEY = 'compra_en_curso';

export interface CompraEnCurso {
  url: string;
  state: unknown;
}

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
    // Dentro del flujo se guarda cada paso; al salir (p. ej. a leer los términos)
    // el contador se pausa en pantalla pero el apartado sigue: se puede volver.
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(e => {
      const url = (e as NavigationEnd).urlAfterRedirects;
      if (PURCHASE_FLOW.test(url)) {
        sessionStorage.setItem(COMPRA_KEY, JSON.stringify({ url, state: history.state }));
      } else {
        this.stopTimer();
      }
    });
  }

  startTimer(): void {
    // Si ya está corriendo, no lo reiniciamos (se mantiene entre páginas del flujo)
    if (this.isRunning()) return;

    this.stopTimer();
    let deadline = Number(sessionStorage.getItem(DEADLINE_KEY));
    if (!deadline || deadline <= Date.now()) {
      deadline = Date.now() + this.DURATION_SECONDS * 1000;
      sessionStorage.setItem(DEADLINE_KEY, String(deadline));
    }
    this.isRunning.set(true);

    // Se cuenta contra el reloj (no restando 1 por tick): así tampoco se
    // atrasa si el navegador duerme la pestaña.
    const tick = () => {
      const left = Math.ceil((deadline - Date.now()) / 1000);
      if (left > 0) {
        this.timeLeft.set(left);
      } else {
        this.handleExpired();
      }
    };
    tick();
    this.timerSub = timer(1000, 1000).subscribe(tick);
  }

  /** Arranca (o reinicia) el contador hasta `vence`, la hora en que expira el apartado. */
  iniciarHasta(vence: number): void {
    this.stopTimer();
    sessionStorage.setItem(DEADLINE_KEY, String(vence));
    this.startTimer();
  }

  stopTimer(): void {
    this.timerSub?.unsubscribe();
    this.isRunning.set(false);
  }

  /** Compra apartada a la que se puede volver; null si no hay o ya venció. */
  compraPendiente(): CompraEnCurso | null {
    const deadline = Number(sessionStorage.getItem(DEADLINE_KEY));
    if (!deadline || deadline <= Date.now()) return null;
    try {
      return JSON.parse(sessionStorage.getItem(COMPRA_KEY) ?? 'null');
    } catch {
      return null;
    }
  }

  /** Milisegundos que quedan del apartado (0 si no hay). */
  restante(): number {
    return Math.max(Number(sessionStorage.getItem(DEADLINE_KEY)) - Date.now(), 0);
  }

  resetCheckout(): void {
    this.stopTimer();
    sessionStorage.removeItem(DEADLINE_KEY);
    sessionStorage.removeItem(COMPRA_KEY);
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
