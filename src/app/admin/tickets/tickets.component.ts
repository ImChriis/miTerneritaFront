import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TicketsService } from '../../@core/services/tickets.service';
import { Observable, startWith, switchMap, tap } from 'rxjs';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { Ticket } from '../../@core/models/ticket.model';
import { CreateTicketsComponent } from './components/create-tickets/create-tickets.component';
import { UpdateTicketsComponent } from './components/update-tickets/update-tickets.component';
import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { EventsService } from '../../@core/services/events.service';

@Component({
  selector: 'app-tickets',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputText,
    CheckboxModule
  ],
  templateUrl: './tickets.component.html',
  styleUrl: './tickets.component.scss'
})
export class TicketsComponent implements OnInit{
  private ticketsService = inject(TicketsService);
  private dialogService = inject(DialogService);
  private eventsService = inject(EventsService);
  private messageService = inject(MessageService);
  ref: DynamicDialogRef | undefined;
  isModalOpen = false;
  tickets$!: Observable<Ticket[]>;

  ngOnInit() {
    this.tickets$ = this.ticketsService.refreshTicketsObservable$.pipe(
      startWith(null),
      switchMap(() => {
        return this.ticketsService.getTickets();
      })
    )
  }

  openCreateModal(){
    this.isModalOpen = true;
    this.ref = this.dialogService.open(CreateTicketsComponent, {
      header: 'Agregar Evento',
      width: '50vw',
      // height: '65vh',
      modal: true,
      closable: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      },
      styleClass: 'custom-dialog'
    })
    this.ref.onClose.subscribe(() => {
      this.isModalOpen = false;
    });
  }

  openEditModal(ticket: Ticket){
    this.isModalOpen = true;
    this.ref = this.dialogService.open(UpdateTicketsComponent, {
      header: 'Agregar Evento',
      width: '50vw',
      // height: '65vh',
      modal: true,
      closable: true,
      data: { ticket },
            breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      },
      styleClass: 'custom-dialog'
    })
    this.ref.onClose.subscribe(() => {
      this.isModalOpen = false;
    });
  }

  getEventName(id: number){
    let eventName = '';
    this.eventsService.getEventById(id).pipe(
      tap(event => {
        eventName = event.name;
        console.log('Nombre del evento:', eventName);
      })
    ).subscribe();
    return eventName;
  }
}
