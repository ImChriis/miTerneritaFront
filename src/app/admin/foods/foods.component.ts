import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { FoodsService } from '../../@core/services/foods.service';
import { Observable, startWith, switchMap } from 'rxjs';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CreateFoodsComponent } from './components/create-foods/create-foods.component';
import { UpdateDrinksComponent } from '../drinks/components/update-drinks/update-drinks.component';
import { ButtonModule } from 'primeng/button';
import { UpdateFoodsComponent } from './components/update-foods/update-foods.component';
import { CheckboxModule } from 'primeng/checkbox';
import { Food } from '../../@core/models/foods.model';
import { FormsModule } from '@angular/forms';
import { ConfirmDeleteModalComponent } from '../../shared/components/confirm-delete-modal/confirm-delete-modal.component';
import { MessageService } from 'primeng/api';
import { LoaderComponent } from '../../@core/components/loader/loader.component';

@Component({
  selector: 'app-foods',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputText,
    AsyncPipe,
    CheckboxModule,
    FormsModule,
    LoaderComponent
  ],
  templateUrl: './foods.component.html',
  styleUrl: './foods.component.scss'
})
export class FoodsComponent implements OnInit{
  private foodsService = inject(FoodsService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  ref!: DynamicDialogRef;
  foods$!: Observable<any>;
  isModalOpen = false;
  selectAll = false;
  selectedFoods: Food[] = [];
  isLoading = signal(false);

  ngOnInit(): void {
    this.foods$ = this.foodsService.refreshFoodsObservable$.pipe(
      startWith(null),
      switchMap(() => {
        this.isLoading.set(true);
        return this.foodsService.getAllFoods();
      })
    )
  }

  openCreateModal(){
    this.ref = this.dialogService.open(CreateFoodsComponent, {
     header: 'Agregar Comida',
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

  openEditModal(foods: any){
    this.ref = this.dialogService.open(UpdateFoodsComponent, {
      width: '55vw',
      modal: true,
      closable: true,
      data: { foods },
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      },
      styleClass: 'custom-dialog2'
    });

    this.ref.onClose.subscribe(() => {
      this.isModalOpen = false;
    });
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
