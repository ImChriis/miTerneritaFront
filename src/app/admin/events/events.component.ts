import { Component, inject, OnInit } from '@angular/core';
import { EventsService } from '../../@core/services/events.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Observable } from 'rxjs';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CreateEventsComponent } from './components/create-events/create-events.component';
import { UpdateEventsComponent } from './components/update-events/update-events.component';
import { Event } from '../../@core/models/event.model';
import { InputText } from 'primeng/inputtext';

@Component({
  selector: 'app-events',
  imports: [
    CommonModule,
    TableModule,
    InputText
  ],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss'
})
export class EventsComponent implements OnInit{
  private eventsService = inject(EventsService);
  private dialogService = inject(DialogService);
  ref: DynamicDialogRef | undefined;
  isModalOpen = false;
  events$!: Observable<Event[]>;

  ngOnInit(): void {
    this.events$ = this.eventsService.getEvents();
  }

  openCreateModal(){
    this.isModalOpen = true;
    this.ref = this.dialogService.open(CreateEventsComponent, {
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
    });
    this.ref.onClose.subscribe(() => {
      this.isModalOpen = false;
    });
  }

  openEditModal(event: any){
    this.isModalOpen = true;
    this.ref = this.dialogService.open(UpdateEventsComponent, {
      header: 'Agregar Evento',
      width: '50vw',
      // height: '65vh',
      modal: true,
      closable: true,
      data: { event },
       breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      },
      styleClass: 'custom-dialog'
    });
    this.ref.onClose.subscribe(() => {
      this.isModalOpen = false;
    });
  }
}
