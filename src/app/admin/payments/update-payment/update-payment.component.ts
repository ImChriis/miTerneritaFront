import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  banco!: string
  referencia!: string;

   status = [
    { label: 'Disponible', value: 1 },
    { label: 'No Disponible', value: 0 }
  ];

  ngOnInit(){
    console.log('Payment to update:', this.payment);

    this.name = this.payment.idUser?.name;
    this.lastName = this.payment.idUser?.lastName;
    this.cedula = this.payment.idUser?.cedula;
    this.event = this.payment.idEvents?.name;
    this.date = this.payment.date;
    this.idPaymentDetails = this.payment.idPaymentDetails;
    this.cantidad = this.payment.cantidad;
    this.total = this.payment.total;
    this.banco = this.payment.banco;
    this.referencia = this.payment.referencia;
  }
}
