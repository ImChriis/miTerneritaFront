import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MessageService } from 'primeng/api';
import { environment } from '../../../environments/environment.developer';
import { EventsService } from '../../@core/services/events.service';
import { eventImage } from '../../@core/utils/event-utils';
import { LineaConsumo, MenuEvento, ProductoMenu } from '../../@core/models/menu.model';
import { PurchaseStepsComponent } from '../../shared/components/purchase-steps/purchase-steps.component';
import { PriceSummaryComponent } from '../../shared/components/price-summary/price-summary.component';

interface SelectedItem {
  id: number;
  name: string;
  cantidad: number;
  total: number;
}

/** El mismo tope por producto que valida el backend. */
const MAX_POR_PRODUCTO = 50;

@Component({
  selector: 'app-consume',
  imports: [DecimalPipe, PurchaseStepsComponent, PriceSummaryComponent],
  templateUrl: './consume.component.html',
  styleUrl: './consume.component.scss'
})
export class ConsumeComponent implements OnInit {
  private eventsService = inject(EventsService);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly apiImg = environment.apiImg;
  readonly max = MAX_POR_PRODUCTO;
  idEvent!: number;
  name = signal('');
  wallpaper = signal('');
  /** Entradas elegidas en el paso anterior. */
  selected: SelectedItem[] = [];

  menu = signal<MenuEvento | null>(null);
  loading = signal(true);
  private cart = signal<Record<string, number>>({});

  /** Filtro de la carta: una sección del menú o todas. */
  readonly filtros = [
    { valor: 'todo', etiqueta: 'Todo', icono: 'pi pi-th-large' },
    { valor: 'Comidas', etiqueta: 'Comida', icono: 'pi pi-shopping-bag' },
    { valor: 'Con alcohol', etiqueta: 'Bebidas', icono: 'pi pi-star' },
    { valor: 'Sin alcohol', etiqueta: 'Sin alcohol', icono: 'pi pi-heart' }
  ];
  filtro = signal('todo');
  secciones = computed(() =>
    (this.menu()?.secciones ?? []).filter(s => this.filtro() === 'todo' || s.nombre === this.filtro())
  );
  /** Productos por sección, para el contador de cada filtro. */
  conteo = computed(() => {
    const total: Record<string, number> = { todo: 0 };
    for (const s of this.menu()?.secciones ?? []) {
      total[s.nombre] = s.productos.length;
      total['todo'] += s.productos.length;
    }
    return total;
  });

  lineas = computed<LineaConsumo[]>(() =>
    (this.menu()?.secciones ?? [])
      .flatMap(s => s.productos)
      .filter(p => this.qty(p) > 0)
      .map(p => ({
        idFood: p.idFood,
        idDrinks: p.idDrinks,
        name: p.nombre,
        cantidad: this.qty(p),
        total: this.qty(p) * p.precioUsd,
        personas: p.personas
      }))
  );
  /** Personas que entran con las botellas elegidas (acceso General). */
  accesos = computed(() => this.lineas().reduce((suma, l) => suma + l.personas * l.cantidad, 0));
  totalEntradas = computed(() => this.selected.reduce((suma, t) => suma + t.total, 0));
  totalConsumo = computed(() => this.lineas().reduce((suma, l) => suma + l.total, 0));
  total = computed(() => this.totalEntradas() + this.totalConsumo());
  entradas = computed(() => this.selected.reduce((suma, t) => suma + t.cantidad, 0) + this.accesos());

  ngOnInit(): void {
    this.idEvent = Number(this.route.snapshot.paramMap.get('id'));
    this.selected = (history.state?.selected as SelectedItem[]) ?? [];

    this.eventsService.getEventById(this.idEvent).subscribe({
      next: event => {
        this.name.set(event.name);
        this.wallpaper.set(eventImage(event.image1 || event.flyer));
      }
    });

    this.eventsService.getMenu(this.idEvent).subscribe({
      next: menu => {
        // Evento sin consumo: no hay nada que elegir aquí.
        if (!menu.consumo) {
          this.continue();
          return;
        }
        this.menu.set(menu);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private key(p: ProductoMenu) {
    return p.idFood ? `f${p.idFood}` : `d${p.idDrinks}`;
  }

  qty(p: ProductoMenu) {
    return this.cart()[this.key(p)] ?? 0;
  }

  add(p: ProductoMenu) {
    if (this.qty(p) >= MAX_POR_PRODUCTO) return;
    this.cart.update(c => ({ ...c, [this.key(p)]: this.qty(p) + 1 }));
  }

  remove(p: ProductoMenu) {
    this.cart.update(c => ({ ...c, [this.key(p)]: Math.max(this.qty(p) - 1, 0) }));
  }

  back() {
    this.router.navigate(['/home/event', this.idEvent, 'ticket']);
  }

  continue() {
    if (!this.selected.length && this.accesos() === 0) {
      if (!this.loading()) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Elige tu acceso',
          detail: 'Agrega una entrada o una botella que incluya acceso para continuar.'
        });
      } else {
        this.back();
      }
      return;
    }

    this.router.navigate(['/home/event', this.idEvent, 'ticket', 'checkout'], {
      state: { selected: this.selected, consumo: this.lineas() },
      replaceUrl: !this.menu()
    });
  }
}
