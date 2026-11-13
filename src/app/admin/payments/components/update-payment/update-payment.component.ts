import { CommonModule } from '@angular/common';
import { TasaService } from '../../../../@core/services/tasa.service';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { PaymentService } from '../../../../@core/services/payment.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { environment } from '../../../../../environments/environment.developer';

@Component({
  selector: 'app-update-payment',
  imports: [
    CommonModule,
    ButtonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './update-payment.component.html',
  styleUrl: './update-payment.component.scss'
})
export class UpdatePaymentComponent implements OnInit, OnDestroy{
  private tasaService = inject(TasaService);
  private paymentService = inject(PaymentService);
  private dialogConfig = inject(DynamicDialogConfig);
  private messageService = inject(MessageService);
  private dialogRef = inject(DynamicDialogRef);
  private fb = inject(FormBuilder);
  apiImg: string = environment.apiPayments;
  apiDolar: string = environment.apiDolar;
  payment = this.dialogConfig.data.payment;

  /** Entradas de la compra por tipo (sin las líneas borradas). */
  readonly entradasCompradas = ((this.payment.paymentDetails ?? []) as any[])
    .filter(d => !d.isDeleted)
    .map(d => ({ nombre: d.ticket?.name ?? 'Entrada', cantidad: d.ticketNum ?? 1, total: Number(d.total ?? 0) }));

  /** Comida y bebida pre-ordenadas: lo que hay que entregar en barra. */
  readonly consumo = ((this.payment.consumeDetails ?? []) as any[]).map(c => ({
    nombre: c.idFood?.description ?? c.idDrinks?.description ?? 'Producto',
    cantidad: (c.foodAmount || 0) + (c.drinksAmount || 0),
    total: Number(c.totalConsume ?? 0)
  }));

  /** "Zelle", "Efectivo" o el banco desde el que pagó (Pago Móvil / transferencia). */
  readonly metodo: string =
    this.payment.banco === 'Zelle' || this.payment.banco === 'Efectivo'
      ? this.payment.banco
      : `Bs desde ${this.payment.banco ?? '—'}`;
  selectedStatus = this.payment.status;
  name!: string;
  lastName!: string;
  cedula!: string;
  event!: string;
  date!: string;
  idPaymentDetails!: string;
  cantidad!: number;
  total!: number;
  totalBs!: number | any;
  banco!: string
  referencia!: string;
  tasaDolar!: number | any;
  noDocumento!: string;
  idPayment!: number;
  img!: string;
  sinComprobante = false;
  

   status = [
     { label: 'Pendiente', value: "Pendiente" },
    { label: 'Aprobado', value: "Aprobado" },
    { label: 'Rechazado', value: "Rechazado" }
  ];

  updatePaymentForm = this.fb.group({
    status: new FormControl('')
  })

  ngOnInit(){
    
    // Tasa BCV con la que se hizo el pago; los pagos viejos sin ella usan la del día.
    const calcularBs = (tasa: number) => {
      this.tasaDolar = tasa;
      // Formato con punto en miles y coma en decimales (ej. 12.345,67)
      this.totalBs = (Number(this.payment.totalGeneral) * tasa).toLocaleString('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    };
    const tasaPago = Number(this.payment.tasaDolar);
    if (tasaPago) {
      calcularBs(tasaPago);
    } else {
      this.tasaService.tasa$.subscribe(t => t.valor && calcularBs(t.valor));
    }
    

    this.name = this.payment.idUser?.name;
    this.lastName = this.payment.idUser?.lastName;
    this.cedula = this.payment.idUser?.cedula;
    this.event = this.payment.idEvents?.name;
    this.date = this.payment.date;
    this.idPaymentDetails = this.payment.idPaymentDetails;
    // Suma de entradas de todas las líneas (antes contaba líneas: 3 entradas salían como 1).
    this.cantidad = (this.payment.paymentDetails ?? []).reduce((suma: number, d: any) => suma + (d.ticketNum ?? 1), 0);
    this.total = parseFloat(this.payment.totalGeneral);
    this.banco = this.payment.banco;
    this.referencia = this.payment.referencia;
    this.noDocumento = this.payment.noDocumento;
    this.idPayment = this.payment.idPayment;

    this.updatePaymentForm.patchValue(this.payment);
    this.cargarComprobante();
  }

  cargarComprobante() {
    this.paymentService.getComprobante(this.payment.idPayment).subscribe({
      next: (blob: Blob) => {
        // Limpiar URL previa si existía para no saturar la memoria
        if (this.img && this.img.startsWith('blob:')) {
          URL.revokeObjectURL(this.img);
        }
        // Crear la URL utilizable en la etiqueta <img [src]>
        this.img = URL.createObjectURL(blob);
      },
      error: (err) => {
        console.error('Error al obtener el comprobante:', err);
        this.sinComprobante = true;
      }
    });
  }

  // Revocar la URL al destruir el componente
  ngOnDestroy(): void {
    if (this.img && this.img.startsWith('blob:')) {
      URL.revokeObjectURL(this.img);
    }
  }

  cerrar() {
    this.dialogRef.close();
  }

  onSubmit() {
    this.paymentService.updatePayment(this.idPayment, this.updatePaymentForm.value).subscribe({
      next: (response) => {
        this.messageService.add({severity:'success', summary: 'Pago actualizado', detail: `Estado: ${this.updatePaymentForm.value.status}`});
        this.dialogRef.close();
      },
      error: (error) => {
        console.error('Error updating payment:', error);
        this.messageService.add({severity:'error', summary: 'No se pudo actualizar el pago', detail: error?.error?.message ?? 'Intenta de nuevo'});
      }
    });
  }
}
