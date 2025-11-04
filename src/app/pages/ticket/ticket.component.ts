import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-ticket',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './ticket.component.html',
  styleUrl: './ticket.component.scss'
})
export class TicketComponent {
  private messageService = inject(MessageService);
  private router = inject(Router);
  selected: any[] = [];
  selectedTicket: any;
  cantidad = 1;

  // datos para selección
  selectedZone: any = null;
  impuestoSedemat = 0;
  tasaDolar = 1;
  totalGeneral = 0;

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
      const precio = this.selectedZone.precio ?? 0;

      const totalBase = precio * cantidad;
      const impuesto = totalBase * (this.impuestoSedemat / 100);
      let total = totalBase + impuesto;
      const tasaDolar = this.tasaDolar || 1;
      const totalDolar = total / tasaDolar;

      // redondeo condicional
      total = (total % 1 >= 0.95) ? Math.ceil(total) : Number(total.toFixed(2));

      const seleccionItem = {
        idZona: this.selectedZone.idZona,
        zona: this.selectedZone.descripcion,
        cantidad,
        precio, // precio unitario
        totalBase: Number(totalBase.toFixed(2)),
        impuesto: Number(impuesto.toFixed(2)),
        totalDolar: Number(totalDolar.toFixed(2)),
        tasaDolar: Number(tasaDolar),
        total
      };

      this.selected.push(seleccionItem);
      this.totalGeneral = Number(this.selected.reduce((acc, item) => acc + (item.total ?? 0), 0).toFixed(2));
      console.log('Selección actualizada:', this.selected);
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Debe seleccionar una zona válida.' });
    }
  }

  clearSelection(index: number): void {
    if (index >= 0 && index < this.selected.length) {
      this.selected.splice(index, 1);
      this.totalGeneral = Number(this.selected.reduce((acc, item) => acc + (item.total ?? 0), 0).toFixed(2));
    }
  }

  //  goInvoice(id: number) {
  //   if (this.selected.length === 0) {
  //     this.messageService.add({
  //       severity: 'warn',
  //       summary: 'Advertencia',
  //       detail: 'Debes seleccionar al menos una zona antes de continuar.'
  //     });
  //     return;
  //   }

  //   this.router.navigate(['home/event/', id, 'ticket', 'invoice'], {
  //     state: { selected: this.selected }
  //   });
  // }
}
