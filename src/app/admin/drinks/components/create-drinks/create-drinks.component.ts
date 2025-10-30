import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DrinksService } from '../../../../@core/services/drinks.service';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-create-drinks',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputText,
    ButtonModule,
    SelectModule,
    FormsModule
  ],
  templateUrl: './create-drinks.component.html',
  styleUrl: './create-drinks.component.scss'
})
export class CreateDrinksComponent {
  private drinksService = inject(DrinksService);
  private messageService = inject(MessageService);
  private dialogRef = inject(DynamicDialogRef);
  private fb = inject(FormBuilder);

  drinksForm: FormGroup
}
