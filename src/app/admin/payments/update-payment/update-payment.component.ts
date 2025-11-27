import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { PaymentService } from '../../../@core/services/payment.service';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Select } from 'primeng/select';

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
export class UpdatePaymentComponent implements OnInit{
  private paymentService = inject(PaymentService);
  private dialogConfig = inject(DynamicDialogConfig);
  private fb = inject(FormBuilder);
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
  totalBs!: number;
  banco!: string
  referencia!: string;
  tasaDolar!: number
  noDocumento!: string;
  idPayment!: number;

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

    this.name = this.payment.idUser?.name;
    this.lastName = this.payment.idUser?.lastName;
    this.cedula = this.payment.idUser?.cedula;
    this.event = this.payment.idEvents?.name;
    this.date = this.payment.date;
    this.idPaymentDetails = this.payment.idPaymentDetails;
    this.cantidad = this.payment.cantidad;
    this.total = this.payment.montoDolar;
    this.totalBs = parseFloat(this.payment.totalGeneral);
    this.banco = this.payment.banco;
    this.referencia = this.payment.referencia;
    this.noDocumento = this.payment.noDocumento;
    this.idPayment = this.payment.idPayment;

    this.updatePaymentForm.patchValue(this.payment);
  }

  onSubmit() {

    this.paymentService.updatePayment(this.idPayment, this.updatePaymentForm.value).subscribe({
      next: (response) => {
        console.log('Payment updated successfully:', response);
        // You can add additional logic here, such as closing the dialog or showing a success message
      },
      error: (error) => {
        console.error('Error updating payment:', error);
        // Handle error scenarios here
      }
    });
  }
}
