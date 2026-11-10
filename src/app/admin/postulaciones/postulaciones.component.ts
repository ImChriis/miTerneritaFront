import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ESTADOS_POSTULACION, Postulacion } from '../../@core/models/postulacion.model';
import { PostulacionesService } from '../../@core/services/postulaciones.service';
import { ConfirmDeleteModalComponent } from '../../shared/components/confirm-delete-modal/confirm-delete-modal.component';

@Component({
  selector: 'app-postulaciones',
  imports: [DatePipe, FormsModule, SelectModule, TableModule],
  templateUrl: './postulaciones.component.html',
  styleUrl: './postulaciones.component.scss'
})
export class PostulacionesComponent implements OnInit {
  private service = inject(PostulacionesService);
  private messageService = inject(MessageService);
  private dialogService = inject(DialogService);

  readonly estados = ESTADOS_POSTULACION.map(e => ({ label: e, value: e }));
  lista = signal<Postulacion[]>([]);
  /** Puestos que muestra el formulario público; el admin los abre o cierra. */
  puestos = signal<string[]>([]);
  abiertos = signal<string[]>([]);
  cargando = signal(true);
  filtro = signal<string>('Todas');
  busqueda = signal('');

  /** Pastillas de filtro con su cantidad. */
  pastillas = computed(() => [
    { estado: 'Todas', n: this.lista().length },
    ...ESTADOS_POSTULACION.map(estado => ({ estado, n: this.lista().filter(p => p.estado === estado).length }))
  ]);

  visibles = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    return this.lista().filter(
      p =>
        (this.filtro() === 'Todas' || p.estado === this.filtro()) &&
        (!q || `${p.nombre} ${p.apellido} ${p.cedula} ${p.email} ${p.telefono} ${p.puesto}`.toLowerCase().includes(q))
    );
  });

  ngOnInit() {
    this.service.puestos().subscribe(({ puestos, abiertos }) => {
      this.puestos.set(puestos);
      this.abiertos.set(abiertos);
    });
    this.service.listar().subscribe({
      next: lista => {
        this.lista.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.messageService.add({ severity: 'error', summary: 'No se pudieron cargar las postulaciones' });
      }
    });
  }

  alternarPuesto(puesto: string) {
    const anterior = this.abiertos();
    const nuevos = anterior.includes(puesto) ? anterior.filter(p => p !== puesto) : [...anterior, puesto];
    this.abiertos.set(nuevos);
    this.service.guardarPuestos(nuevos).subscribe({
      next: r => this.abiertos.set(r.abiertos),
      error: () => {
        this.abiertos.set(anterior);
        this.messageService.add({ severity: 'error', summary: 'No se pudieron guardar los puestos' });
      }
    });
  }

  verCv(p: Postulacion) {
    this.service.cv(p.idPostulacion).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener');
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'No se pudo abrir el CV' })
    });
  }

  /** 0414 123 4567 -> https://wa.me/584141234567 */
  whatsapp(telefono: string): string {
    const digitos = telefono.replace(/\D/g, '');
    return `https://wa.me/${digitos.startsWith('0') ? '58' + digitos.slice(1) : digitos}`;
  }

  cambiarEstado(p: Postulacion, estado: string) {
    const anterior = p.estado;
    this.reemplazar({ ...p, estado });
    this.service.cambiarEstado(p.idPostulacion, estado).subscribe({
      next: actualizada => this.reemplazar(actualizada),
      error: () => {
        this.reemplazar({ ...p, estado: anterior });
        this.messageService.add({ severity: 'error', summary: 'No se pudo cambiar el estado' });
      }
    });
  }

  eliminar(p: Postulacion) {
    const ref = this.dialogService.open(ConfirmDeleteModalComponent, {
      header: 'Eliminar postulación',
      width: '420px',
      modal: true,
      data: { message: `¿Eliminar la postulación de ${p.nombre} ${p.apellido}? No se puede deshacer.` },
      breakpoints: { '640px': '94vw' }
    });
    ref?.onClose.subscribe((confirmado: boolean) => {
      if (!confirmado) return;
      this.service.eliminar(p.idPostulacion).subscribe({
        next: () => {
          this.lista.update(l => l.filter(x => x.idPostulacion !== p.idPostulacion));
          this.messageService.add({ severity: 'success', summary: 'Postulación eliminada' });
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'No se pudo eliminar' })
      });
    });
  }

  private reemplazar(p: Postulacion) {
    this.lista.update(l => l.map(x => (x.idPostulacion === p.idPostulacion ? p : x)));
  }
}
