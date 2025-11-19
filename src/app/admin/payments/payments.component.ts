import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { PaymentService } from '../../@core/services/payment.service';
import { Observable } from 'rxjs';
import { UpdatePaymentComponent } from './update-payment/update-payment.component';
import { Payment } from '../../@core/models/payment.model';

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

  ngOnInit(): void {
    this.payments$ = this.paymentsService.getAllPayments();
  }

  openUpdateModal(payment: Payment) {
    this.isModalOpen = true;
    this.ref = this.dialogService.open(UpdatePaymentComponent, {
      header: 'Actualizar pago',
      width: '50vw',
      // height: '65vh',
      modal: true,
      closable: true,
      data: { payment },
       breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      },
      styleClass: 'custom-dialog'
    });
    this.ref.onClose.subscribe(() => {
      this.isModalOpen = false;
    });
  }
}
