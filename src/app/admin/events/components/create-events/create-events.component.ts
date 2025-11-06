import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { EventsService } from '../../../../@core/services/events.service';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormEvent } from '../../../../@core/models/forms/form-events';
import { EditorModule } from 'primeng/editor';

@Component({
  selector: 'app-create-events',
  imports: [
    CommonModule,
    InputText,
    ButtonModule,
    ReactiveFormsModule,
    EditorModule
  ],
  templateUrl: './create-events.component.html',
  styleUrl: './create-events.component.scss'
})
export class CreateEventsComponent {
  private eventsService = inject(EventsService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  private dialogRef = inject(DynamicDialogRef);
  previewUrlL: string | null = null;

  previewUrls: Record<'flyer' | 'image1' | 'image2' | 'image3', string | null> = {
    flyer: null,
    image1: null,
    image2: null,
    image3: null
  };

  eventsForm: FormGroup<FormEvent> = this.fb.group({
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
    status: new FormControl<number | null>(1, { nonNullable: true })
  });

  onFileSelect(event: any, controlName: 'flyer'|'image1'|'image2'|'image3') {
    const file: File | null = event?.target?.files && event.target.files.length > 0 ? event.target.files[0] : null;
    this.eventsForm.get(controlName)?.setValue(file);

   // revocar preview anterior si era blob
  const prev = this.previewUrls[controlName];
    if (prev && prev.startsWith('blob:')) {
      URL.revokeObjectURL(prev);
    }
    this.previewUrls[controlName] = null;

    if (file instanceof File) {
      this.previewUrls[controlName] = URL.createObjectURL(file);
    }
  }

  removeSelectedFile(controlName: 'flyer'|'image1'|'image2'|'image3') {
    this.eventsForm.get(controlName)?.setValue(null);
    const prev = this.previewUrls[controlName];
    if (prev && prev.startsWith('blob:')) {
     URL.revokeObjectURL(prev);
    }
    this.previewUrls[controlName] = null;
  }

  ngOnDestroy(): void {
    // revocar todas las object URLs
    Object.values(this.previewUrls).forEach(url => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
  }


  onSubmit(){
    const fv = this.eventsForm.value;
    const fd = new FormData();

    Object.entries(fv).forEach(([k, v]) => {
      // archivos
      if (v instanceof File) {
        fd.append(k, v);
        return;
      }

      // strings no vacíos
      if (typeof v === 'string') {
        if (v.trim() !== '') fd.append(k, v);
        return;
      }

      // números (incluye 0)
      if (typeof v === 'number') {
        fd.append(k, String(v));
        return;
      }

      // fechas
      if (Object.prototype.toString.call(v) === '[object Date]') {
        fd.append(k, (v as unknown as Date).toISOString().split('T')[0]);
        return;
      }

      // otros
      if (v !== null && v !== undefined) {
        fd.append(k, String(v));
      }
    });

    // debug (opcional)
    for (const pair of fd.entries()) {
      console.log(pair[0], pair[1]);
    }

    this.eventsService.createEvent(fd).subscribe({
      next: (res: any) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Evento creado correctamente.' });
        // limpiar previews revocando blobs
        Object.values(this.previewUrls).forEach(url => { if (url && url.startsWith('blob:')) URL.revokeObjectURL(url); });
        this.dialogRef.close(true);
        window.location.reload();
      },
      error: (err: any) => {
        console.error('Error al crear evento:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el evento.' });
      }
    });
  }
}
