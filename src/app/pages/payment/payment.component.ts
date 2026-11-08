import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PaymentService } from '../../@core/services/payment.service';
import { TimerServiceService } from '../../@core/services/timer-service.service';
import { eventImage, formatTime12, parseEventDate } from '../../@core/utils/event-utils';
import { SucceededPaymentModalComponent } from '../../shared/components/succeeded-payment-modal/succeeded-payment-modal.component';
import { PurchaseStepsComponent } from '../../shared/components/purchase-steps/purchase-steps.component';
import { PriceSummaryComponent } from '../../shared/components/price-summary/price-summary.component';
import { TasaService } from '../../@core/services/tasa.service';

type Method = 'pagomovil' | 'zelle';

export const BANKS = [
  { value: 'Banesco', label: 'BANESCO BANCO UNIVERSAL S.A.C.A.' },
  { value: '100% Banco', label: '100% BANCO, BANCO UNIVERSAL C.A.' },
  { value: 'Bancamiga', label: 'BANCAMIGA, BANCO UNIVERSAL, C.A.' },
  { value: 'Bancaribe', label: 'BANCARIBE C.A. BANCO UNIVERSAL' },
  { value: 'Banco activo', label: 'BANCO ACTIVO' },
  { value: 'Banco caroni', label: 'BANCO CARONI C.A. BANCO UNIVERSAL' },
  { value: 'Banco de la  FANB', label: 'BANCO DE LA FANB' },
  { value: 'Banco de la gente emprendedora', label: 'BANCO DE LA GENTE EMPRENDEDORA' },
  { value: 'Banco de Venezuela', label: 'BANCO DE VENEZUELA' },
  { value: 'Banco del Tesoro', label: 'BANCO DEL TESORO' },
  { value: 'Banco digital de los trabajadores', label: 'BANCO DIGITAL DE LOS TRABAJADORES' },
  { value: 'Banco Exterior', label: 'BANCO EXTERIOR C.A BANCO UNIVERSAL' },
  { value: 'Banco Mercantil', label: 'BANCO MERCANTIL' },
  { value: 'Banco Nacional de credito', label: 'BANCO NACIONAL DE CREDITO' },
  { value: 'Banco plaza', label: 'BANCO PLAZA, BANCO UNIVERSAL' },
  { value: 'Banco provincial', label: 'BANCO PROVINCIAL' },
  { value: 'Banco Sofitasa', label: 'BANCO SOFITASA' },
  { value: 'Bancrecer', label: 'BANCRECER, S.A. BANCO MICROFINANCIERO' },
  { value: 'Banplus', label: 'BANPLUS BANCO UNIVERSAL, C.A.' },
  { value: 'BFC banco fondo comun', label: 'BFC BANCO FONDO COMÚN' },
  { value: 'Del sur banco universal', label: 'DEL SUR BANCO UNIVERSAL' },
  { value: 'R4', label: 'R4, BANCO MICROFINANCIERO, C.A.' },
  { value: 'Venezolano de credito', label: 'VENEZOLANO DE CRÉDITO' }
];

/** Datos de las cuentas receptoras (edítalos aquí). */
const RECEIVING_ACCOUNTS: Record<Method, { label: string; value: string }[]> = {
  pagomovil: [
    { label: 'Banco', value: 'Banplus' },
    { label: 'Cuenta', value: '0124-0124-01-0123456789' },
    { label: 'Tipo', value: 'Corriente' },
    { label: 'Teléfono', value: '04241234567' }
  ],
  zelle: [
    { label: 'Titular', value: 'Juan Perez' },
    { label: 'Teléfono', value: '042412345674' },
    { label: 'Correo', value: 'juanperez@gmail.com' }
  ]
};

import { CapFirstPipe } from '../../shared/pipes/cap-first.pipe';

@Component({
  selector: 'app-payment',
  imports: [CapFirstPipe, DatePipe, DecimalPipe, ReactiveFormsModule, PurchaseStepsComponent, PriceSummaryComponent],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss'
})
export class PaymentComponent implements OnInit, OnDestroy {
  private paymentsService = inject(PaymentService);
  private messageService = inject(MessageService);
  private tasaService = inject(TasaService);
  private timerService = inject(TimerServiceService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private dialogService = inject(DialogService);

  readonly banks = BANKS;
  readonly accounts = RECEIVING_ACCOUNTS;

  ref!: DynamicDialogRef;
  previewUrl: string | null = null;
  fileName = '';
  idEvents!: number;
  idUser!: number;
  total = 0;
  /** Total en Bs a la tasa BCV del día (pago móvil). */
  totalBs = computed(() => this.tasaService.bs(this.total));
  paymentData: any;
  submitting = signal(false);
  method = signal<Method>('pagomovil');

  event = computed(() => this.paymentData?.event ?? null);
  day = computed(() => parseEventDate(this.event()?.date));
  time = computed(() => formatTime12(this.event()?.time));
  flyer = computed(() => eventImage(this.event()?.flyer || this.event()?.image1) || 'assets/img/optimized/fondo1.webp');
  backdrop = computed(() => eventImage(this.event()?.image1 || this.event()?.image3) || this.flyer());

  paymentfForm = this.fb.group({
    idEvents: new FormControl<number | null>(null),
    comprobante: new FormControl<File | null>(null, Validators.required),
    banco: new FormControl<string | null>(null, Validators.required),
    referencia: new FormControl<string | null>(null, Validators.required),
    fechaTransferencia: new FormControl<string | null>(null, Validators.required),
    items: new FormControl<any[]>([]),
    totalGeneral: new FormControl<number | null>(null, Validators.required)
  });

  private amount = toSignal(this.paymentfForm.controls.totalGeneral.valueChanges, { initialValue: null });

  /** Monto esperado según el método elegido */
  expected = computed(() => (this.method() === 'zelle' ? this.total : this.totalBs()));
  amountMismatch = computed(() => this.amount() !== null && this.amount() !== this.expected());

  ngOnInit() {
    this.idEvents = Number(this.route.snapshot.paramMap.get('id'));

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user) {
      this.idUser = user.id;
    }

    this.paymentData = history.state?.data;
    if (!this.paymentData?.ticket?.length && !this.paymentData?.consumo?.length) {
      this.messageService.add({ severity: 'info', summary: 'Elige tus entradas', detail: 'Selecciona tus entradas para continuar.' });
      this.router.navigate(['/home/event', this.idEvents, 'ticket'], { replaceUrl: true });
      return;
    }

    this.total = this.paymentData.total;
    const items = (this.paymentData.ticket ?? []).map((t: any) => ({
      idTicket: Number(t.id),
      cantidad: Number(t.cantidad)
    }));
    this.paymentfForm.controls.items.setValue(items);

  }

  setMethod(method: Method) {
    this.method.set(method);
    this.paymentfForm.controls.banco.setValue(method === 'zelle' ? 'Zelle' : null);
  }

  async copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      this.messageService.add({ severity: 'success', summary: 'Copiado', detail: value, life: 1800 });
    } catch {
      // portapapeles no disponible
    }
  }

  invalid(field: 'banco' | 'referencia' | 'fechaTransferencia' | 'totalGeneral' | 'comprobante') {
    const c = this.paymentfForm.controls[field];
    return c.invalid && (c.touched || c.dirty);
  }

  onFileSelect(event: any) {
    const file = event.target.files && event.target.files.length > 0 ? event.target.files[0] : null;
    this.paymentfForm.get('comprobante')?.setValue(file);

    // limpiar preview anterior
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
    }

    if (file instanceof File) {
      // Crear URL temporal para preview
      this.previewUrl = URL.createObjectURL(file);
      this.fileName = file.name;
    }
  }

  removeSelectedFile(input?: HTMLInputElement) {
    // limpiar control y preview
    this.paymentfForm.get('comprobante')?.setValue(null);
    this.fileName = '';
    if (input) input.value = '';
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
    }
  }

  ngOnDestroy(): void {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
    }
  }

  onSubmit() {
    if (this.paymentfForm.invalid || this.amountMismatch()) {
      this.paymentfForm.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Revisa el formulario', detail: 'Completa los datos del pago y verifica el monto.' });
      return;
    }

    // Desestructuramos para extraer lo que no queremos procesar en el loop de FormData
    const { items: _, totalGeneral, tasaDolar, montoDolar, ...fv } = this.paymentfForm.value as any;
    const fd = new FormData();

    // 1. Construir array de items para la API
    const tickets = this.paymentData?.ticket ?? [];
    if (tickets.length) {
      const items = tickets.map((t: any) => ({
        idTicket: Number(t.id),
        cantidad: Number(t.cantidad)
      }));
      fd.append('items', JSON.stringify(items));
    }

    // Comida y bebida apartadas: { idFood | idDrinks, cantidad }
    const consumo = this.paymentData?.consumo ?? [];
    if (consumo.length) {
      fd.append(
        'consumos',
        JSON.stringify(consumo.map((l: any) => ({ idFood: l.idFood, idDrinks: l.idDrinks, cantidad: Number(l.cantidad) })))
      );
    }

    // 2. Iterar solo los campos relevantes del formulario
    Object.entries(fv).forEach(([k, v]) => {
      if (v instanceof File) {
        fd.append(k, v, v.name);
        return;
      }

      if (typeof v === 'string') {
        if (v.trim() !== '') fd.append(k, v);
        return;
      }

      if (typeof v === 'number') {
        fd.append(k, String(v));
        return;
      }

      if (Object.prototype.toString.call(v) === '[object Date]') {
        fd.append(k, (v as unknown as Date).toISOString().split('T')[0]);
        return;
      }

      if (v !== null && v !== undefined) {
        fd.append(k, String(v));
      }
    });

    // 3. Agregar/Asegurar campos críticos globales
    fd.set('idEvents', String(this.idEvents ?? fv.idEvents ?? ''));

    this.submitting.set(true);
    this.paymentsService.createPayment(fd).subscribe({
      next: () => {
        this.submitting.set(false);
        this.timerService.resetCheckout();
        this.removeSelectedFile();
        this.paymentfForm.reset();
        this.ref = this.dialogService.open(SucceededPaymentModalComponent, {
          width: '440px',
          modal: true,
          breakpoints: { '640px': '92vw' }
        });
      },
      error: (err: any) => {
        console.error('Error al enviar pago:', err);
        this.submitting.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo enviar el pago. Intenta de nuevo.' });
      }
    });
  }
}
