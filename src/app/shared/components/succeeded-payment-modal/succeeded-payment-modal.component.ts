import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-succeeded-payment-modal',
  imports: [
    ButtonModule
  ],
  templateUrl: './succeeded-payment-modal.component.html',
  styleUrl: './succeeded-payment-modal.component.scss'
})
export class SucceededPaymentModalComponent {
  private router = inject(Router);
  private ref = inject(DynamicDialogRef, { optional: true });

  goToHome(){
    this.router.navigateByUrl('/');
    this.ref?.close();
  }
}
