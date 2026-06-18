import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DrinksService } from '../../@core/services/drinks.service';
import { MessageService } from 'primeng/api';
import { CreateDrinksComponent } from './components/create-drinks/create-drinks.component';
import { map, Observable, startWith, switchMap } from 'rxjs';
import { Drink } from '../../@core/models/drink.model';
import { UpdateDrinksComponent } from './components/update-drinks/update-drinks.component';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDeleteModalComponent } from '../../shared/components/confirm-delete-modal/confirm-delete-modal.component';


@Component({
  selector: 'app-drinks',
  imports: [
    CommonModule,
    TableModule,
    InputText,
    ButtonModule,
    DialogModule,
    BadgeModule,
    FormsModule,
    ReactiveFormsModule,
    DynamicDialogModule,
    AsyncPipe,
    CheckboxModule
  ],
  templateUrl: './drinks.component.html',
  styleUrl: './drinks.component.scss'
})
export class DrinksComponent implements OnInit{
  private drinksService = inject(DrinksService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  ref: DynamicDialogRef | undefined;
  isModalOpen = false;
  drinks$!: Observable<Drink[]>;
  selectAll = false;
  selectedDrinks: Drink[] = [];

  ngOnInit(): void {
    this.drinks$ = this.drinksService.refreshDrinksObservable$.pipe(
      startWith(null),
      switchMap(() => {
        return this.drinksService.getAllDrinks();
      })
    )
  }

  openCreateModal(){
    this.isModalOpen = true;
    this.ref = this.dialogService.open(CreateDrinksComponent, {
      header: 'Agregar Bebida',
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

  openEditModal(drinks: Drink){
    this.isModalOpen = true;
    this.ref = this.dialogService.open(UpdateDrinksComponent, {
      width: '55vw',
      modal: true,
      closable: true,
      data: { drinks },
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

  showConfirmModal(drink?: Drink, selectedItems: Drink[] = this.selectedDrinks) {
    const itemsToDelete = drink ? [drink] : selectedItems;
  
    this.ref = this.dialogService.open(ConfirmDeleteModalComponent, {
      header: 'Confirmar Eliminación',
      width: '40vw',
      modal: true,
      data: {
        message: itemsToDelete.length === 1
          ? `¿Estás seguro de que deseas eliminar ${itemsToDelete[0].description || 'esta bebida'}?`
          : `¿Estás seguro de que deseas eliminar ${itemsToDelete.length} bebidas?`,
        selectedItems: itemsToDelete
      }
    });
  
    this.ref.onClose.subscribe((confirmed: boolean) => {
      if (confirmed) {
        itemsToDelete.forEach(item => this.executeDeleteDrink(item.idDrinks));
      }
    });
  }

  private executeDeleteDrink(id: number){
    this.drinksService.deleteDrink(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Bebida eliminada correctamente' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ocurrió un error al eliminar la bebida' });
      }
    })
  }

  toggleSelectAll(drinks: Drink[], checked: boolean) {
    this.selectAll = checked;
    this.selectedDrinks = checked ? [...drinks] : [];
  }
}


