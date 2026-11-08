import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TimerComponent } from '../timer/timer.component';

/** Indicador de progreso del flujo de compra + temporizador. */
@Component({
  selector: 'app-purchase-steps',
  imports: [RouterLink, TimerComponent],
  template: `
    <div class="bar">
      <ol class="steps" [style.--progress]="current() / (steps.length - 1)">
        @for (step of steps; track step; let i = $index) {
          <li [class.is-done]="i < current()" [class.is-current]="i === current()" [attr.aria-current]="i === current() ? 'step' : null">
            @if (i === 0 && eventId()) {
              <a class="dot" [routerLink]="['/home/event', eventId()]" aria-label="Volver al evento"><i class="pi pi-check"></i></a>
            } @else {
              <span class="dot">
                @if (i < current()) {
                  <i class="pi pi-check"></i>
                } @else {
                  {{ i + 1 }}
                }
              </span>
            }
            <span class="label">{{ step }}</span>
          </li>
        }
      </ol>
      @if (showTimer()) {
        <app-timer />
      }
    </div>
  `,
  styles: `
    .bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem 2rem;
      flex-wrap: wrap;
      padding: 14px 18px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      background: var(--glass);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    }

    .steps {
      position: relative;
      display: flex;
      justify-content: space-between;
      flex: 1 1 420px;
      max-width: 620px;
      margin: 0;
      padding: 0;
      list-style: none;

      /* línea de fondo y de progreso */
      &::before,
      &::after {
        content: '';
        position: absolute;
        top: 17px;
        left: 18px;
        right: 18px;
        height: 2px;
        border-radius: 2px;
        background: var(--surface-3);
      }

      &::after {
        background: var(--primary);
        transform-origin: left;
        transform: scaleX(var(--progress));
        transition: transform 0.8s var(--ease-out);
      }
    }

    li {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
      min-width: 0;
      color: var(--text-subtle);
      font-size: 0.8rem;
      font-weight: 700;
    }

    .dot {
      display: grid;
      place-items: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 2px solid var(--surface-3);
      background: var(--surface);
      color: var(--text-subtle);
      font-size: 0.85rem;
      text-decoration: none;
      transition: all var(--dur-slow) var(--ease-out);

      .pi {
        font-size: 0.8rem;
      }
    }

    a.dot:hover {
      transform: scale(1.08);
    }

    .is-done {
      color: var(--text-muted);

      .dot {
        border-color: var(--primary);
        background: var(--primary);
        color: var(--primary-contrast);
      }
    }

    .is-current {
      color: var(--text);

      .dot {
        border-color: var(--primary);
        color: var(--primary);
        box-shadow: 0 0 0 5px var(--primary-soft);
      }
    }

    @media (max-width: 520px) {
      .label {
        display: none;
      }

      li.is-current .label {
        display: block;
        position: absolute;
        top: 42px;
        white-space: nowrap;
      }

      .steps {
        margin-bottom: 18px;
      }
    }
  `
})
export class PurchaseStepsComponent {
  readonly steps = ['Evento', 'Entradas', 'Tus datos', 'Pago'];
  current = input.required<number>();
  eventId = input<number | null>(null);
  showTimer = input(true);
}
