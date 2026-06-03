import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { TicketsService } from '../../../../@core/services/tickets.service';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Ticket } from '../../../../@core/models/ticket.model';
import { FormTicket } from '../../../../@core/models/forms/form-ticket';
import { SelectModule } from 'primeng/select';
import { EventsService } from '../../../../@core/services/events.service';
import { Event } from '../../../../@core/models/event.model';

@Component({
  selector: 'app-update-tickets',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputText,
    ButtonModule,
    SelectModule,
    FormsModule
  ],
  templateUrl: './update-tickets.component.html',
  styleUrl: './update-tickets.component.scss'
})
export class UpdateTicketsComponent implements OnInit{
  private ticketsService = inject(TicketsService);
  private messageService = inject(MessageService);
  private dialogRef = inject(DynamicDialogRef);
  private fb = inject(FormBuilder);
  private dialogConfig = inject(DynamicDialogConfig);
  private eventsService = inject(EventsService);
  ticket: any = this.dialogConfig.data.ticket;
  events!: Event[];
  selectedEvent = this.ticket.event?.idEvents;
  selectedStatus = this.ticket.status;
  status = [
    { label: 'Disponible', value: 1 },
    { label: 'No Disponible', value: 0 }
  ];

  updateTicketForm: FormGroup<FormTicket> = this.fb.group({
    name: this.fb.control<string>('', { nonNullable: true }),
    price: this.fb.control<number | null>(null),
    idEvents: this.fb.control<number | null>(null),
    status: this.fb.control<number | null>(1),
  });

  ngOnInit(): void {
    this.updateTicketForm.patchValue({
      ...this.ticket,
      idEvents: this.ticket.event?.idEvents || null
    });
    
    this.eventsService.getEvents().subscribe((events) => {
      this.events = events;
    });
  }

  onSubmit(){
    const formData = this.updateTicketForm.value;
    formData.price = Number(formData.price);

    console.log(formData);

    this.ticketsService.updateTicket(this.ticket.idTicket, formData).subscribe({
      next: (response) => {
        this.messageService.add({severity:'success', summary: 'Éxito', detail: 'Entrada actualizada correctamente'});
        this.dialogRef.close();
      },
      error: (err) => {
        this.messageService.add({severity:'error', summary: 'Error', detail: 'Hubo un problema al actualizar la entrada'});
      }
    }); 
  }
}
