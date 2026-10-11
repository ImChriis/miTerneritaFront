import { Component, inject, OnInit } from '@angular/core';
import { TimerServiceService } from '../../../@core/services/timer-service.service';

/** Muestra el tiempo restante del flujo de compra (el conteo vive en TimerServiceService). */
@Component({
  selector: 'app-timer',
  imports: [],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss'
})
export class TimerComponent implements OnInit {
  readonly timer = inject(TimerServiceService);

  ngOnInit(): void {
    this.timer.startTimer();
  }
}
