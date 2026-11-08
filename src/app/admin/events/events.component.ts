import { Component, inject, OnInit, signal } from '@angular/core';
import { EventsService } from '../../@core/services/events.service';
import { CommonModule } from '@angular/common';
import { debounceTime, defaultIfEmpty, forkJoin, map, merge, Observable, startWith, switchMap } from 'rxjs';
import { TicketsService } from '../../@core/services/tickets.service';
import { Ticket } from '../../@core/models/ticket.model';
import { CatalogoGridComponent, ItemCatalogo } from '../../shared/components/catalogo-grid/catalogo-grid.component';
import { formatTime12, isPastEvent, parseEventDate } from '../../@core/utils/event-utils';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CreateEventsComponent } from './components/create-events/create-events.component';
import { UpdateEventsComponent } from './components/update-events/update-events.component';
import { Event } from '../../@core/models/event.model';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { ConfirmDeleteModalComponent } from '../../shared/components/confirm-delete-modal/confirm-delete-modal.component';
import { FormsModule } from '@angular/forms';
import { LoaderComponent } from '../../@core/components/loader/loader.component';

@Component({
  selector: 'app-events',
  imports: [
    CommonModule,
    CheckboxModule,
    FormsModule,
    LoaderComponent,
    CatalogoGridComponent
  ],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss'
})
export class EventsComponent implements OnInit{
  private eventsService = inject(EventsService);
  private ticketsService = inject(TicketsService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  ref: DynamicDialogRef | undefined;
  isModalOpen = false;
  items$!: Observable<ItemCatalogo<Event>[]>;
  seleccion: ItemCatalogo<Event>[] = [];
  selectAll = false;
  selectedEvents: Event[] = [];
  isLoading = signal(false);
  
   consumo = [
    { label: 'Sí', value: 1 },
    { label: 'No', value: 0 }
  ];


  ngOnInit(): void {
    // Las entradas se guardan después del evento: se recarga también cuando cambian.
    this.items$ = merge(this.eventsService.refreshEventsObservable$, this.ticketsService.refreshTicketsObservable$).pipe(
      debounceTime(150),
      startWith(null),
      switchMap(() => {
        this.isLoading.set(true);
        this.onSeleccion([]);
        // getTickets() no emite si falla: sin el default el forkJoin no emitiría nada.
        return forkJoin({ events: this.eventsService.getEvents(), tickets: this.ticketsService.getTickets().pipe(defaultIfEmpty([] as Ticket[])) });
      }),
      map(({ events, tickets }) =>
        events.map(e => {
          const dia = parseEventDate(e.date);
          const entradas = tickets
            .filter(t => t.idEvents === e.idEvents && t.status === 1)
            .map(t => `${t.name} $${Number(t.price).toFixed(2)}`);
          return {
            id: e.idEvents,
            nombre: e.name,
            detalle: [dia.toLocaleDateString('es-VE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }), formatTime12(e.time), e.room]
              .filter(Boolean)
              .join(' · '),
            precio: null,
            pie: `Aforo ${e.capacity} · Consumo ${e.consumo === 1 ? 'sí' : 'no'}`,
            entradas,
            imagen: e.flyer || e.image1,
            disponible: e.status === 1,
            estado: e.status === 1 ? 'Activo' : 'Inactivo',
            categoria: isPastEvent(e) ? 'Pasados' : 'Próximos',
            // Los más recientes primero
            orden: -dia.getTime(),
            raw: e
          };
        })
      )
    )
  }

  openCreateModal(){
    this.isModalOpen = true;
    this.ref = this.dialogService.open(CreateEventsComponent, {
      header: 'Nuevo evento',
      width: '880px',
      modal: true,
      closable: true,
      breakpoints: { '960px': '94vw' }
    });
    this.ref.onClose.subscribe(() => {
      this.isModalOpen = false;
    });
  }

  openEditModal(event: any){
    this.isModalOpen = true;
    this.ref = this.dialogService.open(UpdateEventsComponent, {
      header: 'Editar evento',
      width: '880px',
      modal: true,
      closable: true,
      data: { event },
      breakpoints: { '960px': '94vw' }
    });
    this.ref.onClose.subscribe(() => {
      this.isModalOpen = false;
    });
  }

  
  onSeleccion(seleccion: ItemCatalogo<Event>[]) {
    this.seleccion = seleccion;
    this.selectedEvents = seleccion.map(i => i.raw);
  }

    showConfirmModal(event?: Event, selectedItems: Event[] = this.selectedEvents) {
      const itemsToDelete = event ? [event] : selectedItems;
    
      this.ref = this.dialogService.open(ConfirmDeleteModalComponent, {
        header: 'Confirmar Eliminación',
        width: '40vw',
        modal: true,
        data: {
          message: itemsToDelete.length === 1
            ? `¿Estás seguro de que deseas eliminar ${itemsToDelete[0].name || 'este evento'}?`
            : `¿Estás seguro de que deseas eliminar ${itemsToDelete.length} eventos?`,
          selectedItems: itemsToDelete
        }
      });
    
      this.ref.onClose.subscribe((confirmed: boolean) => {
        if (confirmed) {
          itemsToDelete.forEach(item => this.executeDeleteEvent(item.idEvents));
        }
      });
    }
  

   private executeDeleteEvent(id: number){
    this.eventsService.deleteEvent(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Evento eliminado correctamente' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ocurrió un error al eliminar el evento' });
      }
    })
  }

   toggleSelectAll(events: Event[], checked: boolean) {
      this.selectAll = checked;
      this.selectedEvents = checked ? [...events] : [];
    }
}
