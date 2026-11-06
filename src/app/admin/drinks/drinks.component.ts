import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DrinksService } from '../../@core/services/drinks.service';
import { MessageService } from 'primeng/api';
import { CreateDrinksComponent } from './components/create-drinks/create-drinks.component';
import { map, Observable, startWith, switchMap } from 'rxjs';
import { Drink } from '../../@core/models/drink.model';
import { UpdateDrinksComponent } from './components/update-drinks/update-drinks.component';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDeleteModalComponent } from '../../shared/components/confirm-delete-modal/confirm-delete-modal.component';
import { LoaderComponent } from '../../@core/components/loader/loader.component';
import { CatalogoGridComponent, ItemCatalogo } from '../../shared/components/catalogo-grid/catalogo-grid.component';



@Component({
  selector: 'app-drinks',
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    BadgeModule,
    FormsModule,
    ReactiveFormsModule,
    DynamicDialogModule,
    AsyncPipe,
    CheckboxModule,
    LoaderComponent,
    CatalogoGridComponent
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
  items$!: Observable<ItemCatalogo<Drink>[]>;
  seleccion: ItemCatalogo<Drink>[] = [];
  selectAll = false;
  selectedDrinks: Drink[] = [];
  isLoading = signal(false);

  ngOnInit(): void {
    this.items$ = this.drinksService.refreshDrinksObservable$.pipe(
      startWith(null),
      switchMap(() => {
        this.isLoading.set(true);
        this.onSeleccion([]);
        return this.drinksService.getAllDrinks();
      }),
      map((res: unknown) =>
        (res as Drink[]).map(d => ({
          id: d.idDrinks,
          nombre: d.description,
          detalle: d.detalle,
          precio: Number(d.price),
          imagen: d.image as unknown as string,
          disponible: d.status === 1,
          categoria: d.categoria,
          personas: d.personas,
          orden: d.orden,
          raw: d
        }))
      )
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

  onSeleccion(seleccion: ItemCatalogo<Drink>[]) {
    this.seleccion = seleccion;
    this.selectedDrinks = seleccion.map(i => i.raw);
  }

  toggleSelectAll(drinks: Drink[], checked: boolean) {
    this.selectAll = checked;
    this.selectedDrinks = checked ? [...drinks] : [];
  }
}


