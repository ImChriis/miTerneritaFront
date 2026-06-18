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
import { ConfirmDeleteModalComponent } from '../../shared/components/confirm-delete-modal/confirm-delete-modal.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tickets',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputText,
    CheckboxModule,
    FormsModule
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
  eventNames = new Map<number, string>();
  selectAll = false;
  selectedTickets: Ticket[] = [];

  ngOnInit() {
    this.tickets$ = this.ticketsService.refreshTicketsObservable$.pipe(
      startWith(null),
      switchMap(() => {
        return this.ticketsService.getTickets();
      })
    )

     this.eventsService.getEvents().subscribe(events => {
      events.forEach(event => {
        this.eventNames.set(event.idEvents, event.name);
      });
    });
  }

  openCreateModal(){
    this.isModalOpen = true;
    this.ref = this.dialogService.open(CreateTicketsComponent, {
      header: 'Agregar Ticket',
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
      header: 'Editar Ticket',
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
    return this.eventNames.get(id) ?? '';
  }

  showConfirmModal(ticket?: Ticket, selectedItems: Ticket[] = this.selectedTickets) {
      const itemsToDelete = ticket ? [ticket] : selectedItems;
    
      this.ref = this.dialogService.open(ConfirmDeleteModalComponent, {
        header: 'Confirmar Eliminación',
        width: '40vw',
        modal: true,
        data: {
          message: itemsToDelete.length === 1
            ? `¿Estás seguro de que deseas eliminar ${itemsToDelete[0].name || 'este ticket'}?`
            : `¿Estás seguro de que deseas eliminar ${itemsToDelete.length} tickets?`,
          selectedItems: itemsToDelete
        }
      });
    
      this.ref.onClose.subscribe((confirmed: boolean) => {
        if (confirmed) {
          itemsToDelete.forEach(item => this.executeDeleteTicket(item.idTicket));
        }
      });
    }

   private executeDeleteTicket(id: number){
      this.ticketsService.deleteTicket(id).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Ticket eliminado correctamente' });
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ocurrió un error al eliminar el ticket' });
        }
      })
    }
  
    toggleSelectAll(tickets: Ticket[], checked: boolean) {
      this.selectAll = checked;
      this.selectedTickets = checked ? [...tickets] : [];
    }
}
