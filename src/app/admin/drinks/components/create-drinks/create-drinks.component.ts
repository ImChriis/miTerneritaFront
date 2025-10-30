import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DrinksService } from '../../../../@core/services/drinks.service';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormDrink } from '../../../../@core/models/forms/form-drink';

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
  
  drinksForm: FormGroup<FormDrink> = this.fb.group({
    description: new FormControl<string>('', { nonNullable: true }),
    price: new FormControl<number | null>(null, { nonNullable: true }),
    status: new FormControl<number | null>(null, { nonNullable: true }),
    image: new FormControl<File | null>(null)
  })

  onSubmit(){
    if(this.drinksForm.valid){
      this.drinksService.createDrink(this.drinksForm.value).subscribe({
        next: (res) => {
          this.messageService.add({severity:'success', summary: 'Éxito', detail: 'Bebida agregada correctamente'});
        },
        error: (err) => {
          this.messageService.add({severity:'error', summary: 'Error', detail: 'Hubo un problema al agregar la bebida'});
        }
      })
    }
  }
}
