import { DatePipe, DecimalPipe } from '@angular/common';
import { MessageService } from 'primeng/api';
import { TasaService } from '../../@core/services/tasa.service';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { startWith, switchMap } from 'rxjs';
import { DashboardService } from '../../@core/services/dashboard.service';
import { PaymentService } from '../../@core/services/payment.service';
import { EventsService } from '../../@core/services/events.service';
import { ThemeService } from '../../@core/services/theme.service';
import { UpdatePaymentComponent } from '../payments/components/update-payment/update-payment.component';
import { Payment } from '../../@core/models/payment.model';
import { Event } from '../../@core/models/event.model';
import { byDateAsc, eventImage, formatTime12, isPastEvent, parseEventDate } from '../../@core/utils/event-utils';

type Filter = 'day' | 'week' | 'month' | 'year';

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
/** Cuántos períodos recientes mostrar en los gráficos */
const LIMIT: Record<Filter, number> = { day: 14, week: 12, month: 12, year: 6 };

import { CapFirstPipe } from '../../shared/pipes/cap-first.pipe';
import { AvatarComponent, avatarSeed } from '../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-dashboard',
  imports: [AvatarComponent, CapFirstPipe, ChartModule, DatePipe, DecimalPipe, FormsModule, RouterLink, SelectButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private paymentsService = inject(PaymentService);
  private eventsService = inject(EventsService);
  private dialogService = inject(DialogService);
  private theme = inject(ThemeService);
  private messageService = inject(MessageService);
  readonly tasa = inject(TasaService);
  ref: DynamicDialogRef | undefined;
  refrescandoTasa = signal(false);
  readonly seed = avatarSeed;

  readonly today = new Date();
  readonly userName = (JSON.parse(localStorage.getItem('user') || '{}').name as string) ?? '';

  loadingKpis = signal(true);
  loadingPayments = signal(true);

  private allPayments = signal<any[]>([]);
  private allUsers = signal<any[]>([]);
  private events = signal<Event[]>([]);

  selectedFilter = signal<Filter>('month');
  selectedUserFilter = signal<Filter>('month');
  filterOptions = [
    { label: 'Día', value: 'day' },
    { label: 'Semana', value: 'week' },
    { label: 'Mes', value: 'month' },
    { label: 'Año', value: 'year' }
  ];

  /** Evento elegido para los indicadores de entradas y pagos (null = todos). */
  eventoFiltro = signal<number | null>(null);

  // ---------- Derivados ----------
  /** Solo clientes: el personal y los admin no cuentan como registros. */
  private clientes = computed(() => this.allUsers().filter(u => u.roleName === 'client'));
  totalClientes = computed(() => this.clientes().length);
  clientesHoy = computed(() => {
    const hoy = new Date().toDateString();
    return this.clientes().filter(u => u.fechaRegistro && new Date(u.fechaRegistro).toDateString() === hoy).length;
  });

  /** Eventos para el selector, el más reciente primero. */
  eventosFiltro = computed(() => [...this.events()].sort((a, b) => byDateAsc(b, a)));

  private pagosFiltrados = computed(() => {
    const id = this.eventoFiltro();
    return id === null ? this.allPayments() : this.allPayments().filter(p => p.idEvents?.idEvents === id);
  });
  pagosEvento = computed(() => {
    const counts = { total: 0, Aprobado: 0, Pendiente: 0, entradas: 0 };
    for (const p of this.pagosFiltrados()) {
      counts.total++;
      if (p.status === 'Aprobado') {
        counts.Aprobado++;
        // Mismo criterio que /payment-details/totals/general: entradas de pagos aprobados.
        for (const d of p.paymentDetails ?? []) if (!d.isDeleted) counts.entradas += Number(d.ticketNum ?? 1);
      } else if (p.status === 'Pendiente') counts.Pendiente++;
    }
    return counts;
  });

  latestPayments = computed(() =>
    [...this.allPayments()].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6)
  );

  allPaymentsCount = computed(() => this.allPayments().length);

  statusCounts = computed(() => {
    const counts = { Aprobado: 0, Pendiente: 0, Rechazado: 0 };
    for (const p of this.allPayments()) {
      if (p.status === 'Aprobado') counts.Aprobado++;
      else if (p.status === 'Pendiente') counts.Pendiente++;
      else counts.Rechazado++;
    }
    return counts;
  });

  upcoming = computed(() =>
    this.events()
      .filter(e => e.status === 1 && !isPastEvent(e))
      .sort(byDateAsc)
      .slice(0, 4)
      .map(e => ({ ...e, day: parseEventDate(e.date), timeLabel: formatTime12(e.time), flyerUrl: eventImage(e.flyer) }))
  );

  // ---------- Colores según el tema ----------
  private palette = computed(() => {
    this.theme.theme(); // dependencia: recalcula al cambiar de tema
    const css = getComputedStyle(document.documentElement);
    const v = (name: string) => css.getPropertyValue(name).trim();
    return {
      text: v('--text-muted'),
      grid: v('--border'),
      primary: v('--primary'),
      success: v('--success'),
      warning: v('--warning'),
      danger: v('--danger'),
      surface: v('--surface')
    };
  });

  paymentsChart = computed(() => {
    const c = this.palette();
    const { labels, data } = this.groupByPeriod(this.allPayments(), this.selectedFilter(), 'date');
    return {
      labels,
      datasets: [
        {
          label: 'Pagos',
          data,
          backgroundColor: c.primary,
          hoverBackgroundColor: c.primary,
          borderRadius: 8,
          maxBarThickness: 36
        }
      ]
    };
  });

  usersChart = computed(() => {
    const c = this.palette();
    const { labels, data } = this.groupByPeriod(this.clientes(), this.selectedUserFilter(), 'fechaRegistro');
    return {
      labels,
      datasets: [
        {
          label: 'Nuevos clientes',
          data,
          borderColor: c.success,
          backgroundColor: c.success + '22',
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointBackgroundColor: c.success
        }
      ]
    };
  });

  statusChart = computed(() => {
    const c = this.palette();
    const s = this.statusCounts();
    return {
      labels: ['Aprobados', 'Pendientes', 'Rechazados'],
      datasets: [
        {
          data: [s.Aprobado, s.Pendiente, s.Rechazado],
          backgroundColor: [c.success, c.warning, c.danger],
          borderColor: c.surface,
          borderWidth: 4,
          hoverOffset: 6
        }
      ]
    };
  });

  axisOptions = computed(() => {
    const c = this.palette();
    return {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: c.text }, grid: { display: false }, border: { display: false } },
        y: { beginAtZero: true, ticks: { color: c.text, precision: 0 }, grid: { color: c.grid }, border: { display: false } }
      }
    };
  });

  doughnutOptions = computed(() => ({
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: { legend: { display: false } }
  }));

  ngOnInit() {
    this.paymentsService.refreshPaymentsObservable$
      .pipe(
        startWith(null),
        switchMap(() => this.paymentsService.getAllPayments())
      )
      .subscribe(payments => {
        this.allPayments.set(payments || []);
        this.loadingPayments.set(false);
      });

    // Entradas y pagos salen de getAllPayments (arriba), así se pueden filtrar por evento.
    this.dashboardService.getTotalUsers().subscribe({
      next: (users: any) => {
        this.allUsers.set(users || []);
        this.loadingKpis.set(false);
      },
      error: () => this.loadingKpis.set(false)
    });

    this.eventsService.getEvents().subscribe(events => this.events.set(events ?? []));
  }

  refrescarTasa() {
    this.refrescandoTasa.set(true);
    const antes = this.tasa.tasa();
    this.tasa.refrescar().subscribe({
      next: t => {
        this.refrescandoTasa.set(false);
        const fecha = t.fecha ? new Date(t.fecha).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit' }) : '';
        // El BCV no publica fines de semana ni feriados: entonces la vigente sigue siendo la última.
        const igual = antes?.valor === t.valor && antes?.fecha === t.fecha;
        this.messageService.add(
          igual
            ? { severity: 'info', summary: 'Ya tienes la tasa más reciente', detail: `El BCV aún no publica una nueva. Vigente del ${fecha}: ${t.valor} Bs/$` }
            : { severity: 'success', summary: 'Tasa actualizada', detail: `${t.valor} Bs/$ · vigente del ${fecha}` }
        );
      },
      error: err => {
        this.refrescandoTasa.set(false);
        this.messageService.add({ severity: 'error', summary: 'Tasa BCV', detail: err?.error?.message ?? 'No se pudo actualizar la tasa' });
      }
    });
  }

  statusClass(status: string) {
    return status === 'Aprobado' ? 'tm-badge--success' : status === 'Pendiente' ? 'tm-badge--warning' : 'tm-badge--danger';
  }

  /** Agrupa por período, ordena cronológicamente y deja solo los últimos N. */
  private groupByPeriod(items: any[], period: Filter, dateField: string) {
    const buckets = new Map<number, { label: string; count: number }>();

    for (const item of items) {
      const raw = item?.[dateField];
      if (!raw) continue;
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) continue;

      let start: Date;
      let label: string;
      switch (period) {
        case 'day':
          start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          label = `${start.getDate()} ${MONTHS[start.getMonth()]}`;
          break;
        case 'week': {
          start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
          label = `${start.getDate()} ${MONTHS[start.getMonth()]}`;
          break;
        }
        case 'month':
          start = new Date(d.getFullYear(), d.getMonth(), 1);
          label = `${MONTHS[start.getMonth()]} ${String(start.getFullYear()).slice(2)}`;
          break;
        default:
          start = new Date(d.getFullYear(), 0, 1);
          label = `${start.getFullYear()}`;
      }

      const key = start.getTime();
      const bucket = buckets.get(key) ?? { label, count: 0 };
      bucket.count += item.amount ? Number(item.amount) : 1;
      buckets.set(key, bucket);
    }

    const sorted = [...buckets.entries()].sort((a, b) => a[0] - b[0]).slice(-LIMIT[period]);
    return { labels: sorted.map(([, b]) => b.label), data: sorted.map(([, b]) => b.count) };
  }

  openUpdateModal(payment: Payment) {
    this.ref = this.dialogService.open(UpdatePaymentComponent, {
      header: 'Revisar pago',
      width: '820px',
      modal: true,
      closable: true,
      data: { payment },
      breakpoints: { '960px': '94vw' }
    });
  }
}
