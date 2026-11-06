import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FoodsService } from '../../@core/services/foods.service';
import { map, Observable, startWith, switchMap } from 'rxjs';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { ProductoFormComponent } from '../../shared/components/producto-form/producto-form.component';
import { CheckboxModule } from 'primeng/checkbox';
import { Food } from '../../@core/models/foods.model';
import { FormsModule } from '@angular/forms';
import { ConfirmDeleteModalComponent } from '../../shared/components/confirm-delete-modal/confirm-delete-modal.component';
import { MessageService } from 'primeng/api';
import { LoaderComponent } from '../../@core/components/loader/loader.component';
import { CatalogoGridComponent, ItemCatalogo } from '../../shared/components/catalogo-grid/catalogo-grid.component';


@Component({
  selector: 'app-foods',
  imports: [
    CommonModule,
    ButtonModule,
    AsyncPipe,
    CheckboxModule,
    FormsModule,
    LoaderComponent,
    CatalogoGridComponent
  ],
  templateUrl: './foods.component.html',
  styleUrl: './foods.component.scss'
})
export class FoodsComponent implements OnInit{
  private foodsService = inject(FoodsService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  ref!: DynamicDialogRef;
  items$!: Observable<ItemCatalogo<Food>[]>;
  seleccion: ItemCatalogo<Food>[] = [];
  isModalOpen = false;
  selectAll = false;
  selectedFoods: Food[] = [];
  isLoading = signal(false);

  ngOnInit(): void {
    this.items$ = this.foodsService.refreshFoodsObservable$.pipe(
      startWith(null),
      switchMap(() => {
        this.isLoading.set(true);
        this.onSeleccion([]);
        return this.foodsService.getAllFoods();
      }),
      map((res: unknown) =>
        (res as Food[]).map(f => ({
          id: f.idFood,
          nombre: f.description,
          detalle: f.detalle,
          precio: Number(f.price),
          imagen: f.image as unknown as string,
          disponible: f.status === 1,
          orden: f.orden,
          raw: f
        }))
      )
    )
  }

  openCreateModal(){
    this.ref = this.dialogService.open(ProductoFormComponent, {
      header: 'Nueva comida',
      width: '780px',
      modal: true,
      closable: true,
      data: { tipo: 'comida' },
      breakpoints: { '960px': '94vw' }
    });
    this.ref.onClose.subscribe(() => {
      this.isModalOpen = false;
    });
  }

  openEditModal(foods: any){
    this.ref = this.dialogService.open(ProductoFormComponent, {
      header: 'Editar comida',
      width: '780px',
      modal: true,
      closable: true,
      data: { tipo: 'comida', producto: foods },
      breakpoints: { '960px': '94vw' }
    });

    this.ref.onClose.subscribe(() => {
      this.isModalOpen = false;
    });
  }

onSeleccion(seleccion: ItemCatalogo<Food>[]) {
    this.seleccion = seleccion;
    this.selectedFoods = seleccion.map(i => i.raw);
  }

  showConfirmModal(food?: Food, selectedItems: Food[] = this.selectedFoods) {
  const itemsToDelete = food ? [food] : selectedItems;

  this.ref = this.dialogService.open(ConfirmDeleteModalComponent, {
    header: 'Confirmar Eliminación',
    width: '40vw',
    modal: true,
    data: {
      message: itemsToDelete.length === 1
        ? `¿Estás seguro de que deseas eliminar ${itemsToDelete[0].description || 'este alimento'}?`
        : `¿Estás seguro de que deseas eliminar ${itemsToDelete.length} alimentos?`,
      selectedItems: itemsToDelete
    }
  });

  this.ref.onClose.subscribe((confirmed: boolean) => {
    if (confirmed) {
      itemsToDelete.forEach(item => this.executeDeleteFood(item.idFood));
    }
  });
}

  private executeDeleteFood(id: number) {
    this.foodsService.deleteFood(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Comida eliminada correctamente' });
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ocurrió un error al eliminar la comida' });
      }
    });
  }


toggleSelectAll(foods: Food[], checked: boolean) {
  this.selectAll = checked;
  this.selectedFoods = checked ? [...foods] : [];
}
}
