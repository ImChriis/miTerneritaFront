import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { PaymentService } from '../../../../@core/services/payment.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Select } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { environment } from '../../../../../environments/environment.developer';

@Component({
  selector: 'app-update-payment',
  imports: [
    CommonModule,
    InputText,
    ButtonModule,
    ReactiveFormsModule,
    FormsModule,
    Select
  ],
  templateUrl: './update-payment.component.html',
  styleUrl: './update-payment.component.scss'
})
export class UpdatePaymentComponent implements OnInit, OnDestroy{
  private paymentService = inject(PaymentService);
  private dialogConfig = inject(DynamicDialogConfig);
  private messageService = inject(MessageService);
  private dialogRef = inject(DynamicDialogRef);
  private fb = inject(FormBuilder);
  apiImg: string = environment.apiPayments;
  apiDolar: string = environment.apiDolar;
  payment = this.dialogConfig.data.payment;
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
  

   status = [
     { label: 'Pendiente', value: "Pendiente" },
    { label: 'Aprobado', value: "Aprobado" },
    { label: 'Rechazado', value: "Rechazado" }
  ];

  updatePaymentForm = this.fb.group({
    status: new FormControl('')
  })

  ngOnInit(){
    console.log('Payment to update:', this.payment);
    
    this.tasaDolar = this.paymentService.getTasaDolarEuro().subscribe((tasa) => {
      this.tasaDolar = tasa;
      console.log('Tasa de cambio obtenida:', this.tasaDolar);
      const totalCalculado = this.payment.totalGeneral * this.tasaDolar;

      // Formato con punto en miles y coma en decimales (ej. 12.345,67)
      this.totalBs = totalCalculado.toLocaleString('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    });
    

    this.name = this.payment.idUser?.name;
    this.lastName = this.payment.idUser?.lastName;
    this.cedula = this.payment.idUser?.cedula;
    this.event = this.payment.idEvents?.name;
    this.date = this.payment.date;
    this.idPaymentDetails = this.payment.idPaymentDetails;
    this.cantidad = this.payment.paymentDetails.length;
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
      }
    });
  }

  // Revocar la URL al destruir el componente
  ngOnDestroy(): void {
    if (this.img && this.img.startsWith('blob:')) {
      URL.revokeObjectURL(this.img);
    }
  }

  onSubmit() {
    this.paymentService.updatePayment(this.idPayment, this.updatePaymentForm.value).subscribe({
      next: (response) => {
        console.log('Payment updated successfully:', response);
        this.messageService.add({severity:'success', summary: 'Success', detail: 'Payment updated successfully'});
        this.dialogRef.close();
      },
      error: (error) => {
        console.error('Error updating payment:', error);
        this.messageService.add({severity:'error', summary: 'Error', detail: 'Failed to update payment'});
      }
    });
  }
}
