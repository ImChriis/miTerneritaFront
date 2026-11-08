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
import { Observable, startWith, switchMap } from 'rxjs';
import { UpdatePaymentComponent } from './components/update-payment/update-payment.component';
import { Payment } from '../../@core/models/payment.model';
import { LoaderComponent } from '../../@core/components/loader/loader.component';
import { CreatePaymentComponent } from './components/create-payment/create-payment.component';

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

  ngOnInit(): void {
    this.payments$ = this.paymentsService.refreshPaymentsObservable$.pipe(
      startWith(null),
      switchMap(() => {
        this.isLoading.set(true);
        return this.paymentsService.getAllPayments();
      })
    );
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
