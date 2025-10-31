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
import { map, Observable } from 'rxjs';
import { Drink } from '../../@core/models/drink.model';


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
    AsyncPipe
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

  ngOnInit(): void {
    this.drinks$ = this.drinksService.getAllDrinks();
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
}
