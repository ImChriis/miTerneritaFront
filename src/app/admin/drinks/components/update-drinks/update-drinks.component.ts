import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { DrinksService } from '../../../../@core/services/drinks.service';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormDrink } from '../../../../@core/models/forms/form-drink';
import { Drink } from '../../../../@core/models/drink.model';
import { CommonModule } from '@angular/common';
import { InputText } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { environment } from '../../../../../environments/environment.developer';

@Component({
  selector: 'app-update-drinks',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    InputText,
    ButtonModule
  ],
  templateUrl: './update-drinks.component.html',
  styleUrl: './update-drinks.component.scss'
})
export class UpdateDrinksComponent implements OnInit, OnDestroy{
  private drinksService = inject(DrinksService);
  private messageService = inject(MessageService);
  private dialogRef = inject(DynamicDialogRef);
  private dialogConfig = inject(DynamicDialogConfig);
  private fb = inject(FormBuilder);
  ref: DynamicDialogRef | undefined;
  drinks = this.dialogConfig.data.drinks;
  previewUrl: string | null = null;
  apiImg: string = environment.apiImg;

  updateDrinksForms: FormGroup<FormDrink> = this.fb.group({
    description: new FormControl<string>('', { nonNullable: true }),
    price: new FormControl<number | null>(null),
    status: new FormControl<number | null>(1, { nonNullable: true }),
    image: new FormControl<File | null>(null)
  });

  ngOnInit() {
    this.updateDrinksForms.patchValue(this.drinks);

    const serverImage = (this.drinks as any).image ?? (this.drinks as any).imagen ?? null;
    this.previewUrl = this.drinks?.image ?? null;
  }

   get previewSrc(): string | null {
    const serverImage = (this.drinks as any)?.image ?? (this.drinks as any)?.imagen ?? null;

    if (this.previewUrl) {
      // si previewUrl es blob: o una URL absoluta, devolverla tal cual
      if (/^(blob:|https?:\/\/)/.test(this.previewUrl)) {
        return this.previewUrl;
      }
      // si es solo nombre de archivo, concatenar con apiImg
      return `${this.apiImg}/${String(this.previewUrl).replace(/^\/+/, '')}`;
    }

    // si no hay preview seleccionada, usar la imagen del servidor (si existe)
    return serverImage ? `${this.apiImg}/${String(serverImage).replace(/^\/+/, '')}` : null;
  }

  onFileSelect(event: any) {
    const file = event.target.files && event.target.files.length > 0 ? event.target.files[0] : null;
    this.updateDrinksForms.get('image')?.setValue(file);

       // liberar preview anterior si era blob
    if (this.previewUrl && this.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl);
    }

    if (file instanceof File) {
      this.previewUrl = URL.createObjectURL(file);
    } else {
      // si canceló selección, volver a mostrar imagen existente (si la hay)
       const serverImage = (this.drinks as any).image ?? (this.drinks as any).imagen ?? null;
      this.previewUrl = this.drinks?.image ?? null;
    }
  }

   removeSelectedFile() {
    this.updateDrinksForms.get('image')?.setValue(null);
    if (this.previewUrl && this.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl);
    }
    // dejar la preview en la imagen existente del servidor o null
   const serverImage = (this.drinks as any).image ?? (this.drinks as any).imagen ?? null;
    this.previewUrl = this.drinks?.image ?? null;
  }

  ngOnDestroy(): void {
    if (this.previewUrl && this.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl);
    }
  }

  onSubmit(){
    if (this.updateDrinksForms.invalid) return;

    const formValue = this.updateDrinksForms.value;
    const imageValue = formValue.image;

    // Si hay archivo -> enviar FormData (multipart)
    if (imageValue instanceof File) {
      const formData = new FormData();

      formData.append('_method', 'PUT');

      Object.entries(formValue).forEach(([key, value]) => {
        if (key === 'image' && value instanceof File) {
          formData.append('image', value);
        } else if (value === null || value === undefined || value === '') {
          // saltar campos vacíos
          return;
        } else {
          formData.append(key, String(value));
        }
      });

      // debug
      for (const pair of formData.entries()) {
        console.log('FormData', pair[0], pair[1]);
      }

      this.drinksService.updateDrink(this.drinks!.idDrinks, formData).subscribe({
        next: (response) => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Bebida actualizada con éxito' });
          this.dialogRef.close();
          window.location.reload();
        },
        error: (error) => {
          console.error('Error al actualizar la bebida:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar la bebida' });
        }
      });

    } else {
      // Sin archivo -> enviar JSON (no multipart)
      const jsonBody: any = {
        ...formValue,
        image: this.drinks.image, // mantener la ruta/valor anterior si aplica
        idDrinks: this.drinks.idDrinks
      };

      // eliminar campos nulos/vacíos si no quieres enviarlos
      Object.keys(jsonBody).forEach(k => {
        if (jsonBody[k] === null || jsonBody[k] === undefined || jsonBody[k] === '') {
          delete jsonBody[k];
        }
      });

      console.log('JSON body', jsonBody);

      this.drinksService.updateDrinkJson(this.drinks!.idDrinks, jsonBody).subscribe({
        next: (response) => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Bebida actualizada con éxito' });
          this.dialogRef.close();
          window.location.reload();
        },
        error: (error) => {
          console.error('Error al actualizar la bebida (json):', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar la bebida' });
        }
      });
    }
  }
}
