import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TicketsService } from '../../@core/services/tickets.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tickets',
  imports: [
    CommonModule,
    TableModule
  ],
  templateUrl: './tickets.component.html',
  styleUrl: './tickets.component.scss'
})
export class TicketsComponent {
  private ticketsService = inject(TicketsService);
  isModalOpen = false;
  tickets$!: Observable<any>;

  openCreateModal(){

  }

  openEditModal(drink: any){

  }
}
