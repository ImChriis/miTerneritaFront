import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { TicketsService } from '../../../../@core/services/tickets.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { FormTicket } from '../../../../@core/models/forms/form-ticket';
import { SelectModule } from 'primeng/select';
import { EventsService } from '../../../../@core/services/events.service';
import { Event } from '../../../../@core/models/event.model';

@Component({
  selector: 'app-create-tickets',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputText,
    ButtonModule,
    SelectModule,
    FormsModule
  ],
  templateUrl: './create-tickets.component.html',
  styleUrl: './create-tickets.component.scss'
})
export class CreateTicketsComponent implements OnInit{
  private ticketsService = inject(TicketsService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private eventsService = inject(EventsService);
  private fb = inject(FormBuilder);
  ref: DynamicDialogRef | undefined;
  events!: Event[];
  selectedEvent: any = null;

  ngOnInit(): void {
    this.ticketsService.getTickets();
    this.eventsService.getEvents().subscribe((events) => { 
      this.events = events;
    });
  }

  ticketForm: FormGroup<FormTicket> = this.fb.group({
    name: this.fb.control<string>('', { nonNullable: true }),
    price: this.fb.control<number | null>(null),
    idEvents: this.fb.control<number | null>(null),
    status: this.fb.control<number | null>(1),
  });

  onSubmit(){
    this.ticketsService.createTicket(this.ticketForm.value).subscribe({
      next: (response) => {
        this.messageService.add({severity:'success', summary: 'Éxito', detail: 'Entrada creada correctamente'});
        this.ref?.close();
        window.location.reload();
      },
      error: (err) => {
        this.messageService.add({severity:'error', summary: 'Error', detail: 'Hubo un problema al crear la entrada'});
      }
    });
  }
}
