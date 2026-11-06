import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { EventsService } from '../../@core/services/events.service';
import { Event } from '../../@core/models/event.model';
import { eventImage, formatTime12, parseEventDate } from '../../@core/utils/event-utils';
import { PurchaseStepsComponent } from '../../shared/components/purchase-steps/purchase-steps.component';
import { LineaConsumo } from '../../@core/models/menu.model';
import { PriceSummaryComponent } from '../../shared/components/price-summary/price-summary.component';

interface SelectedItem {
  id: number;
  name: string;
  cantidad: number;
  total: number;
}

import { CapFirstPipe } from '../../shared/pipes/cap-first.pipe';

@Component({
  selector: 'app-checkout',
  imports: [CapFirstPipe, DatePipe, DecimalPipe, ReactiveFormsModule, PurchaseStepsComponent, PriceSummaryComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  private eventsService = inject(EventsService);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  idEvents!: number;
  selected: SelectedItem[] = [];
  /** Comida y bebida apartadas en el paso de consumo. */
  consumo: LineaConsumo[] = [];
  total = 0;
  totalEntradas = 0;
  totalConsumo = 0;
  count = 0;

  event = signal<Event | null>(null);
  day = computed(() => parseEventDate(this.event()?.date));
  time = computed(() => formatTime12(this.event()?.time));
  flyer = computed(() => eventImage(this.event()?.flyer || this.event()?.image1) || 'assets/img/optimized/fondo1.webp');
  backdrop = computed(() => eventImage(this.event()?.image1 || this.event()?.image3) || this.flyer());

  userData = this.fb.nonNullable.group({
    name: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(7)]],
    identification: ['', Validators.required]
  });

  ngOnInit() {
    this.idEvents = Number(this.route.snapshot.paramMap.get('id'));
    this.selected = (history.state?.selected as SelectedItem[]) ?? [];
    this.consumo = (history.state?.consumo as LineaConsumo[]) ?? [];
    const accesos = this.consumo.reduce((acc, l) => acc + l.personas * l.cantidad, 0);

    // Se llegó sin entradas ni botella con acceso (p. ej. enlace directo): volvemos a elegir
    if (!this.selected.length && !accesos) {
      this.messageService.add({ severity: 'info', summary: 'Elige tus entradas', detail: 'Selecciona tus entradas para continuar.' });
      this.router.navigate(['/home/event', this.idEvents, 'ticket'], { replaceUrl: true });
      return;
    }

    this.totalEntradas = this.selected.reduce((acc, item) => acc + item.total, 0);
    this.totalConsumo = this.consumo.reduce((acc, item) => acc + item.total, 0);
    this.total = this.totalEntradas + this.totalConsumo;
    this.count = this.selected.reduce((acc, item) => acc + item.cantidad, 0) + accesos;

    this.eventsService.getEventById(this.idEvents).subscribe({
      next: event => this.event.set(event)
    });

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userData.patchValue({
      name: user.name ?? '',
      lastName: user.lastName ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      identification: user.cedula ?? ''
    });
  }

  invalid(field: 'name' | 'lastName' | 'email' | 'phone' | 'identification') {
    const c = this.userData.controls[field];
    return c.invalid && (c.touched || c.dirty);
  }

  back() {
    this.router.navigate(['/home/event', this.idEvents, 'ticket']);
  }

  proceedToPayment() {
    if (this.userData.invalid) {
      this.userData.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Revisa tus datos', detail: 'Completa los campos marcados.' });
      return;
    }

    const paymentData = {
      user: this.userData.getRawValue(),
      total: this.total,
      ticket: this.selected,
      consumo: this.consumo,
      event: this.event()
    };

    this.router.navigate(['/home/event/' + this.idEvents + '/ticket/checkout/payment'], { state: { data: paymentData } });
  }
}
