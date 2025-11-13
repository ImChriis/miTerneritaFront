import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { PaymentService } from '../../@core/services/payment.service';
import { MessageService } from 'primeng/api';
import { FormPayment } from '../../@core/models/forms/form-payment';
import { ActivatedRoute } from '@angular/router';
import { SettingsService } from '../../@core/services/settings.service';
import { Settings } from '../../@core/models/settings.model';

@Component({
  selector: 'app-payment',
  imports: [
    CommonModule,
    InputTextModule,
    SelectModule,
    ReactiveFormsModule
  ],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss'
})
export class PaymentComponent implements OnInit {
  private paymentsService = inject(PaymentService);
  private messageService = inject(MessageService);
  private settingsService = inject(SettingsService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  previewUrl: string | null = null;
  idEvents!: number;
  idUser!: number;
  total!: number;
  totalBs!: number;
  paymentData: any;
  tasaDolar!: number;

  paymentfForm: FormGroup<FormPayment> = this.fb.group({
    idUser: new FormControl<number | null>(null),
    idEvents: new FormControl<number | null>(null),
    totalGeneral: new FormControl<number | null>(null),
    tasaDolar: new FormControl<number | null>(null),
    montoDolar: new FormControl<number | null>(null),
    comprobante: new FormControl<File | null>(null),
    banco: new FormControl<string | null>(null),
    referencia: new FormControl<string | null>(null),
    fechaTransferencia: new FormControl<string | null>(null), // 'YYYY-MM-DD'
    status: new FormControl<number | null>(1)
  })

  ngOnInit() {
    this.idEvents = Number(this.route.snapshot.paramMap.get('id'));

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if(user){
      this.idUser = user.id;
      // console.log('User ID en payment:', this.idUser);
    }

    this.paymentData = history.state;
    console.log("paymentData", this.paymentData)
    if(this.paymentData){
      this.total = this.paymentData.total;
    }
    
    this.settingsService.getSettings().subscribe({
      next: (settings: any) => {
        console.log('Settings obtenidos en payment:', settings);
        this.totalBs = this.total * settings.Dolar;
        this.tasaDolar = settings.Dolar;
      }
    });
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
    }
}

  removeSelectedFile() {
    // limpiar control y preview
    this.paymentfForm.get('comprobante')?.setValue(null);
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

  onSubmit(){
    const formValue = this.paymentfForm.value;
    formValue.idUser = this.idUser;
    formValue.idEvents = this.idEvents;
    formValue.tasaDolar = this.tasaDolar;
    formValue.montoDolar = this.total;

    console.log("formValue to send:", formValue);
    
    this.paymentsService.createPayment(formValue).subscribe({
      next: (response) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Pago enviado correctamente. Su pago será verificado en breve.' });
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo enviar el pago. Intente nuevamente más tarde.' });
      }
    })
  }

}
