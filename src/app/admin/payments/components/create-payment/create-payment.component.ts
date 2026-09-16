import { Component, inject } from '@angular/core';
import { PaymentService } from '../../../../@core/services/payment.service';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UsersService } from '../../../../@core/services/users.service';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-payment',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './create-payment.component.html',
  styleUrl: './create-payment.component.scss'
})
export class CreatePaymentComponent {
  private userService = inject(UsersService);
  private paymentsSevice = inject(PaymentService);
  private messageService = inject(MessageService);
  private dialogService = inject(DialogService);
  private ref = inject(DynamicDialogRef, { optional: true })
  private fb = inject(FormBuilder);

  paymentFom = this.fb.group({
    cedula: [''],
    // idEvents: [''],
    // banco: [''],
    // referencia: [''],
    // fechaTransferencia: [''],
    // items: [],
  });

  searchUserByCedula(event: any){
    const NuCedula = event?.target.value;

    // console.log(NuCedula);

    this.userService.searchUserByCedula(NuCedula).subscribe({
      next: (res: any) => {
       if(res){
        // console.log(res);
         this.paymentFom.patchValue({
          cedula: res.cedula,
         });


         console.log(res);

        this.messageService.add({ severity: 'success', summary: `Usuario: ${res.name} + ${res.lastName} encontrado` });

         setTimeout(() => {
        const el = document.querySelector<HTMLInputElement>(
          'input[formcontrolname="cedula"]'
        );
      el?.focus();
    }, 0);
    }}})
  }
}