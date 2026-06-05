import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { InputText } from "primeng/inputtext";
import { SelectModule } from 'primeng/select';
import { TicketsService } from '../../@core/services/tickets.service';
import { Ticket } from '../../@core/models/ticket.model';
import { EventsService } from '../../@core/services/events.service';
import { environment } from '../../../environments/environment.developer';

@Component({
  selector: 'app-ticket',
  imports: [
    CommonModule,
    FormsModule,
    InputText,
    SelectModule,
],
  templateUrl: './ticket.component.html',
  styleUrl: './ticket.component.scss'
})
export class TicketComponent implements OnInit {
  private ticketService = inject(TicketsService);
  private messageService = inject(MessageService);
  private eventsService = inject(EventsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  selected: any[] = [];
  selectedTicket: any;
  cantidad = 1;
  idEvent!: number;
  selectedZone: Ticket | null = null;
  zones: any[] = [];
  name!: string;
  date!: Date;
  time!: string;
  wallpaper!: string;

  ngOnInit() {
    console.log("Asdsadsa")
    this.idEvent = Number(this.route.snapshot.paramMap.get('id'));
    console.log('ID del evento:', this.idEvent);

    this.ticketService.getTicktesByEvent(this.idEvent).subscribe({
      next: (tickets) => {
        this.zones = tickets;
        console.log('Zonas obtenidas:', this.zones);
      }
    });

    this.eventsService.getEventById(this.idEvent).subscribe({
    next: (event) => {
      this.name = event.name;
      this.date = event.date;
      this.time = event.time;

      const candidate = (event as any).image3 ?? (event as any).flyer ?? (event as any).image ?? (event as any).imagen ?? '';
      this.wallpaper = this.getFullUrl(candidate);

      document.body.style.backgroundImage = `url(${this.wallpaper})`;
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
      document.body.style.backgroundSize = 'cover';
    }
  });
  }

  ngOnDestroy() {
    document.body.style.backgroundImage = '';
    document.body.style.backgroundPosition = '';
    document.body.style.backgroundRepeat = '';
    document.body.style.backgroundSize = '';
  }

    private getFullUrl(path: string): string {
      if (!path) return '';
      // absolute URL
      if (/^https?:\/\//i.test(path)) return path;
      if (/^(assets\/|\/)/.test(path)) return path;
      return `${environment.apiImg}/${path}`;
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
  console.log('Zona seleccionada:', this.selectedZone);
  console.log('Cantidad seleccionada:', this.cantidad);

    if (this.selectedZone && this.cantidad > 0) {
      const cantidad = this.cantidad;
      const precio = this.selectedZone.price ?? 0;

      const total = cantidad * precio
     

      const seleccionItem = {
        id: this.selectedZone.idTicket,
        name: this.selectedZone.name,
        cantidad,
        total
      };

      this.selected.push(seleccionItem);
      // limpiar el select (modelo) y resetear cantidad
      this.selectedZone = null;
      this.cantidad = 1;
      console.log('Selección actualizada:', this.selected);
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Debe seleccionar un espacio válida.' });
    }
  }

  clearSelection(index: number): void {
    if (index >= 0 && index < this.selected.length) {
      this.selected.splice(index, 1);
    }
  }

   goToCheckout(idEvents: number) {
    if (this.selected.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debes seleccionar al menos una zona antes de continuar.'
      });
      return;
    }

    this.router.navigate(['home/event/', idEvents, 'ticket', 'checkout'], {
      state: { selected: this.selected }
    });
  }
}
