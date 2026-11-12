import { DatePipe, DecimalPipe, Location } from '@angular/common';
import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { SettingsService } from '../../@core/services/settings.service';
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

/** Bancos con su código SUDEBAN (participantes BCV 2025). Se guarda y se muestra como "0191 - BNC". */
export const BANKS = [
  { value: '0102 - Venezuela', label: '0102 - Venezuela' },
  { value: '0104 - Venezolano de Crédito', label: '0104 - Venezolano de Crédito' },
  { value: '0105 - Mercantil', label: '0105 - Mercantil' },
  { value: '0108 - Provincial', label: '0108 - Provincial' },
  { value: '0114 - Bancaribe', label: '0114 - Bancaribe' },
  { value: '0115 - Exterior', label: '0115 - Exterior' },
  { value: '0128 - Caroní', label: '0128 - Caroní' },
  { value: '0134 - Banesco', label: '0134 - Banesco' },
  { value: '0137 - Sofitasa', label: '0137 - Sofitasa' },
  { value: '0138 - Plaza', label: '0138 - Plaza' },
  { value: '0146 - Bangente', label: '0146 - Bangente' },
  { value: '0151 - BFC Fondo Común', label: '0151 - BFC Fondo Común' },
  { value: '0156 - 100% Banco', label: '0156 - 100% Banco' },
  { value: '0157 - Del Sur', label: '0157 - Del Sur' },
  { value: '0163 - Tesoro', label: '0163 - Tesoro' },
  { value: '0166 - Agrícola de Venezuela', label: '0166 - Agrícola de Venezuela' },
  { value: '0168 - Bancrecer', label: '0168 - Bancrecer' },
  { value: '0169 - R4', label: '0169 - R4' },
  { value: '0171 - Activo', label: '0171 - Activo' },
  { value: '0172 - Bancamiga', label: '0172 - Bancamiga' },
  { value: '0173 - Internacional de Desarrollo', label: '0173 - Internacional de Desarrollo' },
  { value: '0174 - Banplus', label: '0174 - Banplus' },
  { value: '0175 - Digital de los Trabajadores', label: '0175 - Digital de los Trabajadores' },
  { value: '0177 - BANFANB', label: '0177 - BANFANB' },
  { value: '0178 - N58 Banco Digital', label: '0178 - N58 Banco Digital' },
  { value: '0191 - BNC', label: '0191 - BNC' },
  { value: '0601 - Instituto Municipal de Crédito Popular', label: '0601 - Instituto Municipal de Crédito Popular' }
];

/** Campos de Configuración que se muestran en cada método (los edita el admin). */
const CAMPOS_CUENTA: Record<Method, [string, string][]> = {
  pagomovil: [['Banco', 'pmBanco'], ['Cédula', 'pmCedula'], ['Teléfono', 'pmTelefono']],
  zelle: [['Titular', 'zelleTitular'], ['Teléfono', 'zelleTelefono'], ['Correo', 'zelleCorreo']]
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
  private location = inject(Location);

  /** Vuelve a "Confirma tus datos" con lo que el usuario ya eligió (estado del historial). */
  volver() {
    this.location.back();
  }
  private fb = inject(FormBuilder);
  private dialogService = inject(DialogService);

  readonly banks = BANKS;
  private config = toSignal(inject(SettingsService).getSettings(), { initialValue: null });
  /** Datos de la cuenta receptora de cada método, desde Configuración. */
  readonly accounts = computed(() => {
    const c = (this.config() ?? {}) as Record<string, string | null>;
    const filas = (m: Method) => CAMPOS_CUENTA[m].map(([label, campo]) => ({ label, value: c[campo] ?? '' })).filter(f => f.value);
    return { pagomovil: filas('pagomovil'), zelle: filas('zelle') };
  });

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
  // Redondeo a centavos: la suma en coma flotante daba 112.03999999999999.
  expected = computed(() => (this.method() === 'zelle' ? Math.round(this.total * 100) / 100 : this.totalBs()));
  amountMismatch = computed(() => this.amount() !== null && this.amount() !== this.expected());

  constructor() {
    // En el móvil teclear "1.234,56" exacto es donde más se falla: se rellena el
    // monto esperado (y hoy como fecha) mientras el cliente no los toque.
    const hoy = new Date();
    this.paymentfForm.controls.fechaTransferencia.setValue(
      `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
    );
    effect(() => {
      const esperado = this.expected();
      const monto = this.paymentfForm.controls.totalGeneral;
      if (esperado && !monto.dirty) monto.setValue(esperado);
    });
  }

  /** Monto para pegar en la app del banco: sin separador de miles, coma decimal. */
  copiarMonto() {
    const monto = this.expected();
    if (monto) this.copy(this.method() === 'zelle' ? monto.toFixed(2) : monto.toFixed(2).replace('.', ','));
  }

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
