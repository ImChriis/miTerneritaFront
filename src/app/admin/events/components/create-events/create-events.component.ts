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
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-create-events',
  imports: [
    CommonModule,
    InputText,
    ButtonModule,
    ReactiveFormsModule,
    EditorModule,
    SelectModule
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

  consumo = [
    { label: 'Sí', value: 1 },
    { label: 'No', value: 0 }
  ]

  previewUrls: Record<'flyer' | 'image1' | 'image2' | 'image3', string | null> = {
    flyer: null,
    image1: null,
    image2: null,
    image3: null
  };

  eventsForm: FormGroup<FormEvent> = this.fb.group({
    name: new FormControl<string>('', { nonNullable: true }),
    description: new FormControl('', { nonNullable: true }),
    date: new FormControl<string>('', { nonNullable: true }),
    time: new FormControl<string>('', { nonNullable: true }),
    room: new FormControl('', { nonNullable: true }),
    capacity: new FormControl<number | null>(null),
    flyer: new FormControl<File | null>(null),
    image1: new FormControl<File | null>(null),
    image2: new FormControl<File | null>(null),
    image3: new FormControl<File | null>(null),
    status: new FormControl<number | null>(1, { nonNullable: true }),
    consumo: new FormControl<number | null>(null)
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


onSubmit() {
  const fv = { ...this.eventsForm.value };
  const fd = new FormData();

  // --- ARREGLO PARA 'DATE' Y 'TIME' (ISO 8601 ESTRICTO) ---
  
  // 1. Validar y formatear 'date'
  if (fv.date) {
    let fechaObjeto: Date;
    if (Object.prototype.toString.call(fv.date) === '[object Date]') {
      // fv.date may be typed as string in FormEvent; cast to Date when runtime check passes
      fechaObjeto = (fv.date as unknown) as Date;
    } else {
      // Si viene como string "YYYY-MM-DD", forzamos la creación del objeto
      fechaObjeto = new Date(`${fv.date}T00:00:00`);
    }
    // Reemplazamos por el string ISO 8601 completo que pide el backend
    fv.date = fechaObjeto.toISOString(); 
  }

  // 2. Validar y formatear 'time'
  if (fv.time && typeof fv.time === 'string') {
    // Si viene solo la hora "HH:MM", le pegamos una fecha comodín para poder crear un ISO 8601 válido
    const fechaHoy = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
    const horaObjeto = new Date(`${fechaHoy}T${fv.time}:00`);
    
    // Reemplazamos por el string ISO 8601 completo
    fv.time = horaObjeto.toISOString();
  }
  // ---------------------------------------------------------

  // Tu bucle de mapeo al FormData se queda igual
  Object.entries(fv).forEach(([k, v]) => {
    if (v instanceof File) {
      fd.append(k, v);
      return;
    }

    // Ahora date y time caerán aquí como strings ISO completos e impecables
    if (typeof v === 'string') {
      fd.append(k, v); 
      return;
    }

    if (typeof v === 'number') {
      fd.append(k, v.toString());
      return;
    }

    if (Object.prototype.toString.call(v) === '[object Date]') {
      fd.append(k, (v as unknown as Date).toISOString());
      return;
    }

    if (v !== null && v !== undefined) {
      fd.append(k, String(v));
    }
  });

  // Debug (Revisa en la consola que 'date' y 'time' luzcan como "2026-05-28T...")
  for (const pair of fd.entries()) {
    console.log(pair[0], pair[1]);
  }

  this.eventsService.createEvent(fd).subscribe({
    next: (res: any) => {
      this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Evento creado correctamente.' });
      Object.values(this.previewUrls).forEach(url => { if (url && url.startsWith('blob:')) URL.revokeObjectURL(url); });
      this.dialogRef.close(true);
    },
    error: (err: any) => {
      console.error('Error al crear evento:', err);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el evento.' });
    }
  });
}

  formateTimeString(time: string){
    
  }
}
