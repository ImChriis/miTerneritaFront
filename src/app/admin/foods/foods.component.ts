import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { FoodsService } from '../../@core/services/foods.service';
import { Observable, startWith, switchMap } from 'rxjs';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CreateFoodsComponent } from './components/create-foods/create-foods.component';
import { UpdateDrinksComponent } from '../drinks/components/update-drinks/update-drinks.component';
import { ButtonModule } from 'primeng/button';
import { UpdateFoodsComponent } from './components/update-foods/update-foods.component';

@Component({
  selector: 'app-foods',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputText,
    AsyncPipe
  ],
  templateUrl: './foods.component.html',
  styleUrl: './foods.component.scss'
})
export class FoodsComponent implements OnInit{
  private foodsService = inject(FoodsService);
  private dialogService = inject(DialogService);
  ref!: DynamicDialogRef;
  foods$!: Observable<any>;
  isModalOpen = false;

  ngOnInit(): void {
    this.foods$ = this.foodsService.refreshFoodsObservable$.pipe(
      startWith(null),
      switchMap(() => {
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
}
