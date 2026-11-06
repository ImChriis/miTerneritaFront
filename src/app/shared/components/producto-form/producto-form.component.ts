import { Component, inject, OnDestroy, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputText } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Observable } from 'rxjs';
import { DrinksService } from '../../../@core/services/drinks.service';
import { FoodsService } from '../../../@core/services/foods.service';
import { environment } from '../../../../environments/environment.developer';

export type TipoProducto = 'bebida' | 'comida';

/** Límites del backend (src/common/producto-limites.ts). */
const MAX_NOMBRE = 150;
const MAX_DETALLE = 150;

/**
 * Crear o editar una bebida o una comida de la carta.
 * data: { tipo: 'bebida' | 'comida', producto?: Drink | Food } (sin producto = crear).
 */
@Component({
  selector: 'app-producto-form',
  imports: [ReactiveFormsModule, InputText, SelectModule, ToggleSwitch],
  templateUrl: './producto-form.component.html'
})
export class ProductoFormComponent implements OnDestroy {
  private drinksService = inject(DrinksService);
  private foodsService = inject(FoodsService);
  private messageService = inject(MessageService);
  private ref = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);

  readonly tipo: TipoProducto = this.config.data?.tipo ?? 'bebida';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly producto: any = this.config.data?.producto ?? null;
  readonly esBebida = this.tipo === 'bebida';
  readonly maxDetalle = MAX_DETALLE;
  readonly categorias = ['Con alcohol', 'Sin alcohol'].map(c => ({ label: c, value: c }));

  guardando = signal(false);
  archivo = signal<File | null>(null);
  private fotoActual = this.producto?.image ? `${environment.apiImg}/${this.producto.image}` : null;
  preview = signal<string | null>(this.fotoActual);

  form = inject(FormBuilder).nonNullable.group({
    description: [this.producto?.description ?? '', [Validators.required, Validators.maxLength(MAX_NOMBRE)]],
    detalle: [this.producto?.detalle ?? '', Validators.maxLength(MAX_DETALLE)],
    price: [this.producto ? Number(this.producto.price) : (null as number | null), [Validators.required, Validators.min(0)]],
    orden: [this.producto?.orden ?? 0, [Validators.min(0), Validators.max(9999)]],
    categoria: [this.producto?.categoria ?? this.categorias[0].value],
    personas: [this.producto?.personas ?? 0, [Validators.min(0), Validators.max(50)]],
    status: [this.producto?.status ?? 1]
  });

  invalido(campo: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[campo];
    return c.invalid && (c.touched || c.dirty);
  }

  elegirFoto(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    if (!file) return;
    this.liberarPreview();
    this.archivo.set(file);
    this.preview.set(URL.createObjectURL(file));
  }

  descartarFoto(input: HTMLInputElement) {
    input.value = '';
    this.liberarPreview();
    this.archivo.set(null);
    this.preview.set(this.fotoActual);
  }

  cerrar() {
    this.ref.close();
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const fd = new FormData();
    fd.append('description', v.description.trim());
    fd.append('detalle', v.detalle.trim());
    fd.append('price', String(v.price));
    fd.append('orden', String(v.orden ?? 0));
    fd.append('status', String(v.status));
    if (this.esBebida) {
      fd.append('categoria', v.categoria);
      fd.append('personas', String(v.personas ?? 0));
    }
    const archivo = this.archivo();
    if (archivo) fd.append('image', archivo);

    const id: number | undefined = this.esBebida ? this.producto?.idDrinks : this.producto?.idFood;
    const peticion: Observable<unknown> = this.esBebida
      ? id ? this.drinksService.updateDrink(id, fd) : this.drinksService.createDrink(fd)
      : id ? this.foodsService.updateFood(id, fd) : this.foodsService.createFood(fd);

    this.guardando.set(true);
    peticion.subscribe({
      next: () => {
        const nombre = this.esBebida ? 'Bebida' : 'Comida';
        this.messageService.add({ severity: 'success', summary: id ? `${nombre} actualizada` : `${nombre} creada`, detail: v.description });
        this.ref.close(true);
      },
      error: err => {
        this.guardando.set(false);
        const detalle = err?.error?.message;
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudo guardar',
          detail: Array.isArray(detalle) ? detalle.join(', ') : (detalle ?? 'Intenta de nuevo')
        });
      }
    });
  }

  ngOnDestroy() {
    this.liberarPreview();
  }

  private liberarPreview() {
    const actual = this.preview();
    if (actual?.startsWith('blob:')) URL.revokeObjectURL(actual);
  }
}
