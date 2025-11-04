import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { PaymentService } from '../../@core/services/payment.service';

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
    DynamicDialogModule,
    AsyncPipe
  ],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.scss'
})
export class PaymentsComponent {
  private paymentsService = inject(PaymentService);
  
  isModalOpen = false;

  openCreateModal() {

  }
}
