import { DecimalPipe } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { CheckboxModule } from 'primeng/checkbox';
import { environment } from '../../../../environments/environment.developer';

/** Un producto de la carta (comida o bebida) tal como lo pinta el panel. */
export interface ItemCatalogo<T = unknown> {
  id: number;
  nombre: string;
  detalle?: string | null;
  /** USD; null en lo que no tiene precio (eventos): se muestra `pie`. */
  precio: number | null;
  pie?: string;
  imagen?: string | null;
  disponible: boolean;
  /** Texto de la etiqueta; por defecto Disponible / No disponible. */
  estado?: string;
  categoria?: string | null;
  personas?: number;
  /** Eventos: entradas a la venta ("General $10.00"). */
  entradas?: string[];
  orden?: number;
  raw: T;
}

const normalizar = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/**
 * Carta en tarjetas para el panel (estilo miternerita.club): foto, nombre,
 * descripción, precio en USD y estado; filtro por categoría, búsqueda y
 * páginas de 20, 30 o 50.
 */
@Component({
  selector: 'app-catalogo-grid',
  imports: [DecimalPipe, FormsModule, PaginatorModule, CheckboxModule],
  template: `
    <div class="toolbar">
      <div class="cats" role="group" aria-label="Categorías">
        @for (c of categorias(); track c.nombre) {
          <button type="button" class="cat" [attr.aria-pressed]="categoria() === c.nombre" (click)="elegirCategoria(c.nombre)">
            {{ c.nombre }} <small>{{ c.total }}</small>
          </button>
        }
      </div>
      <input class="search" type="search" placeholder="Buscar" [ngModel]="busqueda()" (ngModelChange)="buscar($event)" aria-label="Buscar producto" />
    </div>

    @if (pagina().length) {
      <div class="grid">
        @for (item of pagina(); track item.id) {
          <article class="card" [class.is-off]="!item.disponible" [class.is-selected]="seleccionados().includes(item)">
            <div class="photo">
              @if (item.imagen) {
                <img class="fondo" [src]="apiImg + '/' + item.imagen" alt="" aria-hidden="true" loading="lazy" />
                <img class="foto" [src]="apiImg + '/' + item.imagen" [alt]="item.nombre" loading="lazy" />
              } @else {
                <i class="pi pi-image" aria-hidden="true"></i>
              }
              <span class="state">{{ item.estado ?? (item.disponible ? 'Disponible' : 'No disponible') }}</span>
              <p-checkbox class="check" [binary]="true" [ngModel]="seleccionados().includes(item)" (ngModelChange)="alternar(item)" [ariaLabel]="'Seleccionar ' + item.nombre" />
            </div>
            <div class="body">
              <h3>{{ item.nombre }}</h3>
              @if (item.detalle) {
                <p>{{ item.detalle }}</p>
              }
              @if (item.personas) {
                <span class="access"><i class="pi pi-users"></i> Acceso General para {{ item.personas }}</span>
              }
              @if (item.entradas?.length) {
                <ul class="entradas" aria-label="Entradas a la venta">
                  @for (e of item.entradas; track e) {
                    <li class="access"><i class="pi pi-ticket"></i> {{ e }}</li>
                  }
                </ul>
              }
            </div>
            <div class="foot">
              @if (item.precio !== null) {
                <strong>\${{ item.precio | number: '1.2-2' }}</strong>
              } @else {
                <span class="pie">{{ item.pie }}</span>
              }
              <div class="actions">
                <button type="button" class="icon" [attr.aria-label]="'Editar ' + item.nombre" (click)="editar.emit(item.raw)"><i class="pi pi-pencil"></i></button>
                <button type="button" class="icon danger" [attr.aria-label]="'Eliminar ' + item.nombre" (click)="eliminar.emit(item.raw)"><i class="pi pi-trash"></i></button>
              </div>
            </div>
          </article>
        }
      </div>
      <p-paginator
        [first]="primero()"
        [rows]="filas()"
        [totalRecords]="filtrados().length"
        [rowsPerPageOptions]="[20, 30, 50]"
        (onPageChange)="paginar($event)"
      />
    } @else {
      <p class="empty">No hay productos que coincidan.</p>
    }
  `,
  styles: `
    :host {
      display: grid;
      gap: 16px;
    }

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .cats {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 2px;
    }

    .cat {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 999px;
      border: 1px solid var(--border-strong);
      background: transparent;
      color: var(--text);
      font-weight: 700;
      font-size: 0.875rem;
      cursor: pointer;

      small {
        font-weight: 400;
        color: var(--text-muted);
        font-variant-numeric: tabular-nums;
      }

      &[aria-pressed='true'] {
        background: var(--text);
        border-color: var(--text);
        color: var(--bg);

        small {
          color: color-mix(in srgb, var(--bg) 70%, transparent);
        }
      }
    }

    .search {
      min-width: 220px;
      padding: 10px 14px;
      border-radius: 999px;
      border: 1px solid var(--border-strong);
      background: var(--surface-2);
      color: var(--text);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
      gap: 16px;
    }

    .card {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      background: var(--surface-2);
      transition:
        border-color var(--dur) var(--ease-out),
        transform var(--dur) var(--ease-out);

      @media (hover: hover) {
        &:hover {
          transform: translateY(-2px);
          border-color: var(--border-strong);
        }
      }

      &.is-selected {
        border-color: var(--primary);
        box-shadow: 0 0 0 3px var(--primary-soft);
      }

      &.is-off .photo img {
        filter: grayscale(1);
        opacity: 0.55;
      }
    }

    /* Recuadro fijo y cuadrado: toda foto entra completa y centrada, sin recortes. */
    .photo {
      position: relative;
      flex: none;
      display: grid;
      place-items: center;
      aspect-ratio: 1;
      overflow: hidden;
      background: var(--photo-bg, #fff);

      img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
      }

      /* La foto entera, sin recortes. */
      .foto {
        padding: 16px;
        object-fit: contain;
      }

      /* Detrás, la misma foto ampliada y difuminada: los cócteles con fondo
         oscuro se extienden hasta los bordes y las botellas sobre blanco se
         quedan en blanco. Sirve igual con el tema claro y el oscuro. */
      .fondo {
        object-fit: cover;
        filter: blur(22px) saturate(1.15);
        transform: scale(1.25);
        opacity: 0.9;
      }

      .pi {
        font-size: 2rem;
        color: var(--text-subtle);
      }
    }

    .state {
      position: absolute;
      left: 10px;
      top: 10px;
      padding: 3px 10px;
      border-radius: 999px;
      background: rgba(17, 17, 17, 0.85);
      color: #fff;
      font-size: 0.72rem;
      font-weight: 700;
    }

    .is-off .state {
      background: #b3261e;
    }

    .check {
      position: absolute;
      right: 10px;
      top: 10px;
    }

    .body {
      flex: 1;
      display: grid;
      align-content: start;
      gap: 6px;
      padding: 14px 14px 0;

      h3 {
        margin: 0;
        font-size: 1rem;
        line-height: 1.3;
        min-height: 2.6em;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      p {
        margin: 0;
        color: var(--text-muted);
        font-size: 0.85rem;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .entradas {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .access {
      justify-self: start;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 10px;
      border-radius: 999px;
      background: var(--primary-soft);
      color: var(--primary);
      font-size: 0.75rem;
      font-weight: 700;
    }

    .foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px 14px;

      strong {
        font-size: 1.1rem;
        font-variant-numeric: tabular-nums;
      }
    }

    .pie {
      color: var(--text-muted);
      font-size: 0.85rem;
      font-weight: 700;
    }

    .actions {
      display: flex;
      gap: 6px;
    }

    .icon {
      display: grid;
      place-items: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text);
      cursor: pointer;

      @media (hover: hover) {
        &.danger:hover {
          border-color: #b3261e;
          color: #b3261e;
        }
      }
    }

    .empty {
      padding: 2rem;
      text-align: center;
      color: var(--text-muted);
    }
  `
})
export class CatalogoGridComponent<T> {
  readonly apiImg = environment.apiImg;

  items = input.required<ItemCatalogo<T>[]>();
  seleccionados = input<ItemCatalogo<T>[]>([]);
  editar = output<T>();
  eliminar = output<T>();
  seleccion = output<ItemCatalogo<T>[]>();

  categoria = signal('Todas');
  busqueda = signal('');
  primero = signal(0);
  filas = signal(20);

  private ordenados = computed(() =>
    [...this.items()].sort(
      (a, b) =>
        (a.categoria ?? '').localeCompare(b.categoria ?? '') ||
        (a.orden ?? 0) - (b.orden ?? 0) ||
        a.nombre.localeCompare(b.nombre)
    )
  );

  categorias = computed(() => {
    const conteo = new Map<string, number>();
    for (const i of this.items()) if (i.categoria) conteo.set(i.categoria, (conteo.get(i.categoria) ?? 0) + 1);
    return [{ nombre: 'Todas', total: this.items().length }, ...[...conteo].sort(([x], [y]) => x.localeCompare(y)).map(([nombre, total]) => ({ nombre, total }))];
  });

  filtrados = computed(() => {
    const q = normalizar(this.busqueda().trim());
    const cat = this.categoria();
    return this.ordenados().filter(
      i => (cat === 'Todas' || i.categoria === cat) && (!q || normalizar(`${i.nombre} ${i.detalle ?? ''}`).includes(q))
    );
  });

  pagina = computed(() => this.filtrados().slice(this.primero(), this.primero() + this.filas()));

  elegirCategoria(nombre: string) {
    this.categoria.set(nombre);
    this.primero.set(0);
  }

  buscar(texto: string) {
    this.busqueda.set(texto);
    this.primero.set(0);
  }

  paginar(e: PaginatorState) {
    this.primero.set(e.first ?? 0);
    this.filas.set(e.rows ?? 20);
  }

  alternar(item: ItemCatalogo<T>) {
    const actual = this.seleccionados();
    this.seleccion.emit(actual.includes(item) ? actual.filter(i => i !== item) : [...actual, item]);
  }
}
