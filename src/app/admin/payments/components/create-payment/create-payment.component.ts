import { Component, inject, OnInit } from '@angular/core';
import { PaymentService } from '../../../../@core/services/payment.service';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UsersService } from '../../../../@core/services/users.service';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { EventsService } from '../../../../@core/services/events.service';
import { Ticket } from '../../../../@core/models/ticket.model';
import { TicketsService } from '../../../../@core/services/tickets.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-create-payment',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputText,
    SelectModule,
    FormsModule,
    ButtonModule
],
  templateUrl: './create-payment.component.html',
  styleUrl: './create-payment.component.scss'
})
export class CreatePaymentComponent implements OnInit{
  private userService = inject(UsersService);
  private paymentsSevice = inject(PaymentService);
  private messageService = inject(MessageService);
  private dialogService = inject(DialogService);
  private eventsService = inject(EventsService);
  private ticketService = inject(TicketsService);
  private ref = inject(DynamicDialogRef, { optional: true })
  private fb = inject(FormBuilder);
  events!: any[];
  selectedEvent: any = null;
  selected: any[] = [];
  cantidad = 1;
  selectedTicket: any;
  selectedZone: Ticket | null = null;
  zones: any[] = [];
  idEvent!: number;
  total!: number;

  paymentFom = this.fb.group({
    cedula: [''],
    idEvents: [''],
    banco: ['Efectivo'],
    referencia: ['Pago en efectivo'],
    fechaTransferencia: [''],
    items: [],
    name: [''],
    idUser: ['']
  });

  ngOnInit(): void {
    this.eventsService.getEvents().subscribe((events) => { 
      this.events = events;
    });

    this.paymentFom.get('idEvents')?.valueChanges.subscribe((idEvent) => {
    if (idEvent) {
      this.cargarTicketsPorEvento(parseInt(idEvent));
    } else {
      this.zones = [];
      this.selectedZone = null;
    }
  });
  }

  cargarTicketsPorEvento(idEvent: number): void {
  this.ticketService.getTicktesByEvent(idEvent).subscribe({
    next: (tickets) => {
      this.zones = tickets;
      this.selectedZone = null; // Reiniciar zona seleccionada al cambiar de evento
    },
    error: (err) => {
      console.error('Error al obtener entradas/zonas:', err);
      this.zones = [];
    }
  });
}

  searchUserByCedula(event: any){
    let NuCedula = event?.target?.value?.trim().toUpperCase() || '';

    if(!NuCedula) {
      this.messageService.add({ severity: 'error', summary: 'Debe ingresar una cédula para buscar el usuario' });
      return;
    }

    // El backend acepta la cédula con o sin prefijo (V-31419200 o 31419200).
    this.paymentFom.patchValue({ name: '', idUser: '' });
    this.userService.searchUserByCedula(encodeURIComponent(NuCedula)).subscribe({
      next: (res: any) => {
       if(res){
         this.paymentFom.patchValue({
          cedula: res.cedula,
          name: `${res.name} ${res.lastName}`,
          idUser: res.id
         });


        this.messageService.add({ severity: 'success', summary: `Usuario: ${res.name} ${res.lastName} encontrado` });

         setTimeout(() => {
        const el = document.querySelector<HTMLInputElement>(
          'input[formcontrolname="cedula"]'
        );
      el?.focus();
    }, 0);
    }},
      error: () => this.messageService.add({ severity: 'warn', summary: 'No hay ningún usuario con esa cédula' })
    })
  }

  increment() {
  if (this.cantidad < 10) {
    this.cantidad++;
  }
}

decrement() {
  if (this.cantidad > 1) {
    this.cantidad--;
  }
}

agregarSeleccion() {

  if (this.selectedZone && this.cantidad > 0) {
    const cantidad = this.cantidad;
    const precio = Number(this.selectedZone.price ?? 0);

    // 1. Validar límite máximo global de 10 entradas
    const cantidadTotal = this.selected.reduce((acc, item) => acc + item.cantidad, 0);
    if (cantidadTotal + cantidad > 10) {
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Advertencia', 
        detail: 'No puedes seleccionar más de 10 entradas en total.' 
      });
      return;
    }

    // 2. Buscar si el ticket/zona ya fue agregado previamente
    const existingIndex = this.selected.findIndex(item => item.id === this.selectedZone?.idTicket);

    if (existingIndex !== -1) {
      // Si ya existe, se acumula la cantidad y se recalcula el subtotal
      this.selected[existingIndex].cantidad += cantidad;
      this.selected[existingIndex].total = this.selected[existingIndex].cantidad * precio;
    } else {
      // Si es un ticket nuevo, se agrega el objeto al arreglo
      const seleccionItem = {
        id: this.selectedZone?.idTicket,
        name: this.selectedZone.name,
        cantidad,
        total: cantidad * precio
      };
      this.selected.push(seleccionItem);
    }

    this.total = this.selected.reduce((acc, item) => acc + item.total, 0);

    // 3. Limpiar formulario
    this.selectedZone = null;
    this.cantidad = 1;

  } else {
    this.messageService.add({ 
      severity: 'warn', 
      summary: 'Advertencia', 
      detail: 'Debe seleccionar un espacio válido.' 
    });
  }
}

  clearSelection(index: number): void {
    if (index >= 0 && index < this.selected.length) {
      this.selected.splice(index, 1);
      this.total = this.selected.reduce((acc, item) => acc + item.total, 0);
    }
  }

  cerrar() {
    this.ref?.close();
  }

  onSubmit(){
    const formData = this.paymentFom.value;
    if (!formData.idUser) {
      this.messageService.add({ severity: 'warn', summary: 'Busca al cliente por su cédula (Enter)' });
      return;
    }
    if (!formData.idEvents || !this.selected.length) {
      this.messageService.add({ severity: 'warn', summary: 'Elige el evento y agrega al menos una entrada' });
      return;
    }

    // Pago en efectivo registrado por el admin: no lleva comprobante.
    const payload: Record<string, unknown> = {
      idEvents: Number(formData.idEvents),
      idUser: Number(formData.idUser),
      banco: formData.banco || 'Efectivo',
      referencia: formData.referencia || 'Pago en efectivo',
      items: this.selected.map(item => ({
        idTicket: item.id,
        cantidad: item.cantidad,
    })),
    };
    if (formData.fechaTransferencia) {
      payload['fechaTransferencia'] = formData.fechaTransferencia;
    }

    this.paymentsSevice.createPayment(payload).subscribe({
      next: (response) => {
        this.messageService.add({severity:'success', summary: 'Éxito', detail: 'Pago creado correctamente'});
        this.ref?.close();
      },
      error: (err) => {
        const detalle = err?.error?.message;
        this.messageService.add({severity:'error', summary: 'No se pudo crear el pago', detail: Array.isArray(detalle) ? detalle.join(', ') : detalle ?? 'Intenta de nuevo'});
      }
    })
  }
}