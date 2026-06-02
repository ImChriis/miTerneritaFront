import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FoodsService } from '../../../../@core/services/foods.service';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { environment } from '../../../../../environments/environment.developer';
import { FormFood } from '../../../../@core/models/forms/form-foods';

@Component({
  selector: 'app-update-foods',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputText,
    ButtonModule,
    SelectModule
  ],
  templateUrl: './update-foods.component.html',
  styleUrl: './update-foods.component.scss'
})
export class UpdateFoodsComponent implements OnInit{
  private foodsService = inject(FoodsService);
  private messageService = inject(MessageService);
  private dialogRef = inject(DynamicDialogRef);
  private dialogConfig = inject(DynamicDialogConfig);
  private fb = inject(FormBuilder);
  ref!: DynamicDialogRef;
  foods = this.dialogConfig.data.foods;
  previewUrl: string | null = null;
  apiImg: string = environment.apiImg;
  selectedStatus = this.foods.status;
  status = [
    { label: 'Disponible', value: 1 },
    { label: 'No Disponible', value: 0 }
  ]

  updateFoodsForms: FormGroup<FormFood> = this.fb.group({
    description: new FormControl<string>('', { nonNullable: true }),
    price: new FormControl<number | null>(null),
    status: new FormControl<number | null>(1, { nonNullable: true }),
    image: new FormControl<File | null>(null)
  });

  ngOnInit() {
    this.updateFoodsForms.patchValue(this.foods);

    const serverImage = (this.foods as any).image ?? (this.foods as any).imagen ?? null;
    this.previewUrl = this.foods?.image ?? null;
  }

  
   get previewSrc(): string | null {
    const serverImage = (this.foods as any)?.image ?? (this.foods as any)?.imagen ?? null;

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
    this.updateFoodsForms.get('image')?.setValue(file);

       // liberar preview anterior si era blob
    if (this.previewUrl && this.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl);
    }

    if (file instanceof File) {
      this.previewUrl = URL.createObjectURL(file);
    } else {
      // si canceló selección, volver a mostrar imagen existente (si la hay)
       const serverImage = (this.foods as any).image ?? (this.foods as any).imagen ?? null;
      this.previewUrl = this.foods?.image ?? null;
    }
  }

     removeSelectedFile() {
    this.updateFoodsForms.get('image')?.setValue(null);
    if (this.previewUrl && this.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl);
    }
    // dejar la preview en la imagen existente del servidor o null
   const serverImage = (this.foods as any).image ?? (this.foods as any).imagen ?? null;
    this.previewUrl = this.foods?.image ?? null;
  }

  ngOnDestroy(): void {
    if (this.previewUrl && this.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl);
    }
  }

  onSubmit(){
    if (this.updateFoodsForms.invalid) return;

    const formValue = this.updateFoodsForms.value;
    const imageValue = formValue.image;

    // Si hay archivo -> enviar FormData (multipart)
    if (imageValue instanceof File) {
      const formData = new FormData();

      // formData.append('_method', 'PUT');

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

      this.foodsService.updateFood(this.foods!.idFood, formData).subscribe({
        next: (response) => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Comida actualizada con éxito' });
          this.dialogRef.close();
        },
        error: (error) => {
          console.error('Error al actualizar la comida:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar la comida' });
        }
      });

    } else {
      // Sin archivo -> enviar JSON (no multipart)
      const jsonBody: any = {
        ...formValue,
        image: this.foods.image, // mantener la ruta/valor anterior si aplica
      };

      // eliminar campos nulos/vacíos si no quieres enviarlos
      Object.keys(jsonBody).forEach(k => {
        if (jsonBody[k] === null || jsonBody[k] === undefined || jsonBody[k] === '') {
          delete jsonBody[k];
        }
      });


      console.log('JSON body', jsonBody);

      this.foodsService.updateFoodJson(this.foods!.idFood, jsonBody).subscribe({
        next: (response) => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Comida actualizada con éxito' });
          this.dialogRef.close();
        },
        error: (error) => {
          console.error('Error al actualizar la comida (json):', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar la comida' });
        }
      });
    }
  }
}
