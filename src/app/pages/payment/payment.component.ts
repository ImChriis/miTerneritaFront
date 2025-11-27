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
import { TabsModule } from 'primeng/tabs';
import { ButtonDirective } from "primeng/button";


@Component({
  selector: 'app-payment',
  imports: [
    CommonModule,
    InputTextModule,
    SelectModule,
    ReactiveFormsModule,
    TabsModule,
    ButtonDirective
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
  idTicket!: number;
  cantidad!: number;
  zelle!: "Zelle";

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
    // status: new FormControl<number | null>(1),

    //extras
    idTicket: new FormControl<number | null>(null),
    ticketNum: new FormControl<number | null>(null),
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
      //arrays
      this.idTicket = this.paymentData.ticket.map((t: any) => t.id).join(',');
      this.cantidad = this.paymentData.ticket.map((t: any) => t.cantidad).join(',');
      console.log("idTicket:", this.idTicket);
      console.log("cantidad:", this.cantidad);
    }
    
    this.settingsService.getSettings().subscribe({
      next: (settings: any) => {
        console.log('Settings obtenidos:', settings);
        // this.totalBs = this.total * settings.Dolar;
        this.totalBs = 30;
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

  onSubmit() {
    const fv: any = this.paymentfForm.value;
    const fd = new FormData();

    // Si hay tickets, enviarlos como arrays (JSON) y como campos repetidos por compatibilidad
    const tickets = this.paymentData?.ticket ?? [];
    if (tickets.length) {
      const ids = tickets.map((t: any) => Number(t.id));
      const cantidades = tickets.map((t: any) => Number(t.cantidad));
      fd.append('idTicket', JSON.stringify(ids));
      fd.append('ticketNum', JSON.stringify(cantidades));
      ids.forEach((id: any) => fd.append('idTicket[]', String(id)));
      cantidades.forEach((c: any) => fd.append('ticketNum[]', String(c)));
    }

    // Iterar campos del formulario y agregarlos correctamente a FormData
    Object.entries(fv).forEach(([k, v]) => {
      // archivos
      if (v instanceof File) {
        fd.append(k, v, v.name);
        return;
      }

      // strings no vacíos
      if (typeof v === 'string') {
        if (v.trim() !== '') fd.append(k, v);
        return;
      }

      // números (incluye 0)
      if (typeof v === 'number') {
        fd.append(k, String(v));
        return;
      }

      // fechas
      if (Object.prototype.toString.call(v) === '[object Date]') {
        fd.append(k, (v as unknown as Date).toISOString().split('T')[0]);
        return;
      }

      // otros
      if (v !== null && v !== undefined) {
        fd.append(k, String(v));
      }
    });

    // Asegurar campos críticos desde el componente
    fd.set('idUser', String(this.idUser ?? fv.idUser ?? ''));
    fd.set('idEvents', String(this.idEvents ?? fv.idEvents ?? ''));
    fd.set('totalGeneral', String(fv.totalGeneral ?? this.total ?? ''));
    fd.set('tasaDolar', String(fv.tasaDolar ?? this.tasaDolar ?? ''));
    fd.set('montoDolar', String(fv.montoDolar ?? this.total ?? ''));

    // Debug: listar pares enviados
    for (const pair of fd.entries()) {
      console.log('FD', pair[0], pair[1]);
    }

    // Enviar FormData (no establecer Content-Type en el servicio)
    this.paymentsService.createPayment(fd).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Pago enviado correctamente.' });
        // revocar preview si existe
        if (this.previewUrl && this.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(this.previewUrl);
          this.previewUrl = null;
        }
        // window.location.reload();
      },
      error: (err: any) => {
        console.error('Error al enviar pago:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo enviar el pago.' });
      }
    });
  }

}
