import { Component, inject, OnInit } from '@angular/core';
import { EventsService } from '../../../../@core/services/events.service';
import { CommonModule } from '@angular/common';
import { InputText } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { EditorModule } from 'primeng/editor';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormEvent } from '../../../../@core/models/forms/form-events';
import { environment } from '../../../../../environments/environment.developer';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-update-events',
  imports: [
    CommonModule,
    InputText,
    ButtonModule,
    EditorModule,
    ReactiveFormsModule,
    SelectModule,
    FormsModule
  ],
  templateUrl: './update-events.component.html',
  styleUrl: './update-events.component.scss'
})
export class UpdateEventsComponent implements OnInit{
  private eventsService = inject(EventsService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  private dialogRef = inject(DynamicDialogRef);
  private dialogConfig = inject(DynamicDialogConfig);
  previewUrlL: string | null = null;
  event = this.dialogConfig.data.event;
  apiImg = environment.apiImg;
  selectedStatus = this.event.status;
  selectedConsumo = this.event.consumo;

   status = [
    { label: 'Disponible', value: 1 },
    { label: 'No Disponible', value: 0 }
  ];

  consumo = [
    { label: 'Sí', value: 1 },
    { label: 'No', value: 0 }
  ];

  previewUrls: Record<'flyer' | 'image1' | 'image2' | 'image3', string | null> = {
    flyer: null,
    image1: null,
    image2: null,
    image3: null
  };

   private initialServerUrls: Record<'flyer' | 'image1' | 'image2' | 'image3', string | null> = {
    flyer: null,
    image1: null,
    image2: null,
    image3: null
  };

  updateEventsForm: FormGroup<FormEvent> = this.fb.group({
    name: new FormControl<string>('', { nonNullable: true }),
    description: new FormControl('', { nonNullable: true }),
    date: new FormControl('', { nonNullable: true }),
    time: new FormControl('', { nonNullable: true }),
    room: new FormControl('', { nonNullable: true }),
    capacity: new FormControl<number | null>(null),
    flyer: new FormControl<File | null>(null),
    image1: new FormControl<File | null>(null),
    image2: new FormControl<File | null>(null),
    image3: new FormControl<File | null>(null),
    status: new FormControl<number | null>(1, { nonNullable: true }),
    consumo: new FormControl<number | null>(null)
  });

  ngOnInit() {
    console.log(this.event);
    this.updateEventsForm.patchValue(this.event);

      // inicializar previews con las imágenes que vienen del servidor (si existen)
    (Object.keys(this.previewUrls) as Array<'flyer'|'image1'|'image2'|'image3'>).forEach(key => {
      // buscar el campo en this.event. Ajusta los nombres si tu backend usa otros.
      const serverVal = (this.event as any)[key] ?? (this.event as any)[`imagen_${key}`] ?? (this.event as any)['imagen'] ?? null;
      this.initialServerUrls[key] = serverVal ?? null;
      // si hay valor del servidor, asignarlo a preview para mostrar inicialmente
      this.previewUrls[key] = serverVal ?? null;
    });
  }

  getPreviewSrc(controlName: 'flyer'|'image1'|'image2'|'image3'): string | null {
    const val = this.previewUrls[controlName];
    if (!val) return null;

    if (/^(blob:|https?:\/\/)/.test(val)) {
      return val;
    }

    // tratar val como nombre/ruta relativa y concatenar con apiImg
    return `${this.apiImg}/${String(val).replace(/^\/+/, '')}`;
  }

  onFileSelect(event: any, controlName: 'flyer'|'image1'|'image2'|'image3') {
    const file: File | null = event?.target?.files && event.target.files.length > 0 ? event.target.files[0] : null;
    this.updateEventsForm.get(controlName)?.setValue(file);

    // revocar previa blob si existía
    const prev = this.previewUrls[controlName];
    if (prev && prev.startsWith('blob:')) {
      URL.revokeObjectURL(prev);
    }

    if (file instanceof File) {
      // mostrar preview del archivo recién seleccionado
      this.previewUrls[controlName] = URL.createObjectURL(file);
    } else {
      // si se canceló selección, volver al valor original del servidor (si existe)
      this.previewUrls[controlName] = this.initialServerUrls[controlName] ?? null;
    }
  }

  removeSelectedFile(controlName: 'flyer'|'image1'|'image2'|'image3') {
    this.updateEventsForm.get(controlName)?.setValue(null);
    const prev = this.previewUrls[controlName];
    if (prev && prev.startsWith('blob:')) {
     URL.revokeObjectURL(prev);
    }
    this.previewUrls[controlName] = null;
  }


  ngOnDestroy(): void {
    // revocar todas las object URLs creadas
    Object.values(this.previewUrls).forEach(url => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
  }

onSubmit() {
  if (this.updateEventsForm.invalid) return;

  const formValue = { ...this.updateEventsForm.value };
  const fileControls = ['flyer', 'image1', 'image2', 'image3'] as const;
  const hasFiles = fileControls.some((key) => formValue[key] instanceof File);

  const toIsoDate = (value: string | null | undefined) => {
    if (!value) return null;
    const date = new Date(`${value}T00:00:00`);
    return isNaN(date.getTime()) ? null : date.toISOString();
  };

  const toIsoTime = (dateValue: string | null | undefined, timeValue: string | null | undefined) => {
    if (!timeValue) return null;
    const baseDate = dateValue || new Date().toISOString().split('T')[0];
    const date = new Date(`${baseDate}T${timeValue}:00`);
    return isNaN(date.getTime()) ? null : date.toISOString();
  };

  formValue.date = toIsoDate(formValue.date) as any;
  formValue.time = toIsoTime(formValue.date, formValue.time) as any;

  if (hasFiles) {
    const formData = new FormData();

    Object.entries(formValue).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (value === null || value === undefined || value === '') {
        return;
      } else {
        formData.append(key, String(value));
      }
    });

    for (const pair of formData.entries()) {
      console.log('FormData', pair[0], pair[1]);
    }

    this.eventsService.updateEvent(this.event.idEvents, formData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Evento actualizado correctamente'
        });
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error al actualizar el evento:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar el evento'
        });
      }
    });
  } else {
    const jsonBody: any = {
      ...formValue,
      flyer: this.initialServerUrls.flyer,
      image1: this.initialServerUrls.image1,
      image2: this.initialServerUrls.image2,
      image3: this.initialServerUrls.image3
    };

    Object.keys(jsonBody).forEach((key) => {
      if (jsonBody[key] === null || jsonBody[key] === undefined || jsonBody[key] === '') {
        delete jsonBody[key];
      }
    });

    console.log('JSON body', jsonBody);

    this.eventsService.updateEventJson(this.event.idEvents, jsonBody).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Evento actualizado correctamente'
        });
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error al actualizar el evento (json):', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar el evento'
        });
      }
    });
  }
}
}
