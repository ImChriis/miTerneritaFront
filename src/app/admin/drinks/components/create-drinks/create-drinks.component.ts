import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
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
export class CreateDrinksComponent implements OnDestroy{
  private drinksService = inject(DrinksService);
  private messageService = inject(MessageService);
  private dialogRef = inject(DynamicDialogRef);
  private fb = inject(FormBuilder);
  previewUrl: string | null = null;
  
  drinksForm: FormGroup<FormDrink> = this.fb.group({
    description: new FormControl<string>('', { nonNullable: true }),
    price: new FormControl<number | null>(null),
    status: new FormControl<number | null>(1, { nonNullable: true }),
    image: new FormControl<File | null>(null)
  })

  onFileSelect(event: any) {
  const file = event.target.files && event.target.files.length > 0 ? event.target.files[0] : null;
  this.drinksForm.get('image')?.setValue(file);

  // limpiar preview anterior
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
    }

    if (file instanceof File) {
      // Crear URL temporal para preview
      this.previewUrl = URL.createObjectURL(file);
    }
}

  removeSelectedFile() {
    // limpiar control y preview
    this.drinksForm.get('image')?.setValue(null);
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
    }
  }

    ngOnDestroy(): void {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
    }
  }

  onSubmit(){
    const formValue = this.drinksForm.value;
    const formData = new FormData();

      // Itera sobre los valores del formulario y los agrega al FormData
  Object.entries(formValue).forEach(([key, value]) => {
    if (key === 'image' && value instanceof File) {
      // Si es un archivo, lo agrega directamente
      formData.append('image', value); // Cambia 'imagen' por 'comprobante' si el backend espera ese nombre
      console.log('Archivo seleccionado:', value);
    } else if (typeof value === 'number') {
      // Convierte números a cadenas antes de agregarlos (incluye 0)
      console.log(`Valor de ${key} (número):`, value);
      formData.append(key, String(value));
    } else if (typeof value === 'string' && value.trim() !== '') {
      // Agrega cadenas directamente si no están vacías
      console.log(`Valor de ${key} (cadena):`, value);
      formData.append(key, value);
    } else if (value instanceof Date) {
      // Convierte fechas a formato ISO antes de agregarlas
      console.log(`Valor de ${key} (fecha):`, value);
      formData.append(key, value.toISOString().split('T')[0]); // Solo la fecha en formato YYYY-MM-DD
    } else if (value !== null && value !== undefined) {
      // Maneja otros tipos de datos
      console.log(`Valor de ${key} (otro tipo):`, value);
      formData.append(key, String(value));
    } else {
      console.warn(`Valor de ${key} es inválido o está vacío:`, value);
    }
  });

  console.log('Datos del formulario enviados:', formData);
  for (let pair of formData.entries()) {
    console.log(`${pair[0]}: ${pair[1]}`);
  }

  this.drinksService.createDrink(formData).subscribe({
    next: (response) => {
      console.log("Datos recibidos del form:", formData);
      this.messageService.add({severity:'success', summary: 'Éxito', detail: 'Bebida creada correctamente'});
      this.dialogRef.close(true);
      window.location.reload();
    },
    error: (error) => {
      this.messageService.add({severity:'error', summary: 'Error', detail: 'Hubo un problema al crear la bebida'});
      console.error('Error al crear la bebida:', error);
    }
  });
  }
}
