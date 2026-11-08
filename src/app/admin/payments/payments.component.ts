import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { PaymentService } from '../../@core/services/payment.service';
import { combineLatest, map, Observable, startWith, switchMap } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { UpdatePaymentComponent } from './components/update-payment/update-payment.component';
import { Payment } from '../../@core/models/payment.model';
import { LoaderComponent } from '../../@core/components/loader/loader.component';
import { CreatePaymentComponent } from './components/create-payment/create-payment.component';

/** Día del pago en hora local, 'AAAA-MM-DD', comparable con un <input type=date>. */
const diaLocal = (fecha: string | Date) => {
  const d = new Date(fecha);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

@Component({
  selector: 'app-payments',
  imports: [
    CommonModule,
    TableModule,
    InputText,
    ButtonModule,
    DialogModule,
    BadgeModule,
    FormsModule,
    ReactiveFormsModule,
    LoaderComponent
    // AsyncPipe
  ],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.scss'
})
export class PaymentsComponent implements OnInit{
  private paymentsService = inject(PaymentService);
  private dialogService = inject(DialogService);
  ref: DynamicDialogRef | undefined;
  payments$!: Observable<any[]>;
  isModalOpen = false;
  isLoading = signal(false);

  /** Filtros: evento (id), estado y rango de fechas 'AAAA-MM-DD' (vacío = sin filtro). */
  readonly filtros = signal({ evento: null as number | null, estado: '', desde: '', hasta: '' });
  readonly estados = ['Aprobado', 'Pendiente', 'Rechazado'];
  /** Eventos que tienen pagos, para el selector. */
  eventos: { id: number; nombre: string }[] = [];
  private filtros$ = toObservable(this.filtros);

  ngOnInit(): void {
    const pagos$ = this.paymentsService.refreshPaymentsObservable$.pipe(
      startWith(null),
      switchMap(() => {
        this.isLoading.set(true);
        return this.paymentsService.getAllPayments();
      })
    );
    this.payments$ = combineLatest([pagos$, this.filtros$]).pipe(
      map(([pagos, f]) => {
        const lista = pagos ?? [];
        this.eventos = [...new Map(lista.filter(p => p.idEvents).map(p => [p.idEvents.idEvents, p.idEvents.name])).entries()]
          .map(([id, nombre]) => ({ id, nombre }))
          .sort((a, b) => a.nombre.localeCompare(b.nombre));
        return lista.filter(p => {
          const dia = diaLocal(p.date);
          return (
            (f.evento === null || p.idEvents?.idEvents === f.evento) &&
            (!f.estado || p.status === f.estado) &&
            (!f.desde || dia >= f.desde) &&
            (!f.hasta || dia <= f.hasta)
          );
        });
      })
    );
  }

  filtrar(cambio: Partial<{ evento: number | null; estado: string; desde: string; hasta: string }>) {
    this.filtros.update(f => ({ ...f, ...cambio }));
  }

  hayFiltros() {
    const f = this.filtros();
    return f.evento !== null || !!f.estado || !!f.desde || !!f.hasta;
  }

  limpiarFiltros() {
    this.filtros.set({ evento: null, estado: '', desde: '', hasta: '' });
  }

  openCreateModal(){
     this.isModalOpen = true;
    this.ref = this.dialogService.open(CreatePaymentComponent, {
      header: 'Registrar pago',
      width: '760px',
      modal: true,
      closable: true,
      breakpoints: { '960px': '94vw' }
    });
    this.ref.onClose.subscribe(() => {
      this.isModalOpen = false;
    });
  }

  openUpdateModal(payment: Payment) {
    this.isModalOpen = true;
    this.ref = this.dialogService.open(UpdatePaymentComponent, {
      header: 'Revisar pago',
      width: '820px',
      modal: true,
      closable: true,
      data: { payment },
      breakpoints: { '960px': '94vw' }
    });
    this.ref.onClose.subscribe(() => {
      this.isModalOpen = false;
    });
  }
}
