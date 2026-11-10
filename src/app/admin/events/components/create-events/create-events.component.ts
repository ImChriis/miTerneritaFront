import { cierreVentaIso } from '../../../../@core/utils/event-utils';
import { CommonModule } from '@angular/common';
import { Component, inject, viewChild } from '@angular/core';
import { switchMap } from 'rxjs';
import { EventTicketsComponent } from '../event-tickets/event-tickets.component';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { EventsService } from '../../../../@core/services/events.service';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormEvent } from '../../../../@core/models/forms/form-events';
import { EditorModule } from 'primeng/editor';
import { SelectModule } from 'primeng/select';
import { ToggleSwitch } from 'primeng/toggleswitch';

@Component({
  selector: 'app-create-events',
  imports: [
    CommonModule,
    InputText,
    ButtonModule,
    ReactiveFormsModule,
    EditorModule,
    SelectModule,
    ToggleSwitch,
    EventTicketsComponent
  ],
  templateUrl: './create-events.component.html',
  styleUrl: './create-events.component.scss'
})
export class CreateEventsComponent {
  private eventsService = inject(EventsService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  private dialogRef = inject(DynamicDialogRef);
  private entradas = viewChild.required(EventTicketsComponent);
  previewUrlL: string | null = null;

  consumo = [
    { label: 'Sí', value: 1 },
    { label: 'No', value: 0 }
  ]

  /** Tipo de evento: solo los conciertos muestran el mapa del salón. */
  /** Salones del local. */
  salones = ['Manhattan', 'Manhattan Bar', 'Salón Chicago', 'Manhattan & Lounge'];

  categorias = [
    { label: 'Evento', value: 'evento' },
    { label: 'Concierto', value: 'concierto' },
    { label: 'Fiesta', value: 'fiesta' }
  ];

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
    cierreFecha: new FormControl('', { nonNullable: true }),
    cierreHora: new FormControl('', { nonNullable: true }),
    room: new FormControl('Manhattan', { nonNullable: true }),
    capacity: new FormControl<number | null>(null),
    flyer: new FormControl<File | null>(null),
    image1: new FormControl<File | null>(null),
    image2: new FormControl<File | null>(null),
    image3: new FormControl<File | null>(null),
    status: new FormControl<number | null>(1, { nonNullable: true }),
    consumo: new FormControl<number | null>(null),
    category: new FormControl<string>('evento', { nonNullable: true })
  });

  /** Fotos del evento: el flyer es la portada; image1..3, la galería. */
  readonly fotos = [
    { key: 'flyer', label: 'Flyer', hint: 'Portada 4:5' },
    { key: 'image1', label: 'Imagen 1', hint: 'Galería' },
    { key: 'image2', label: 'Imagen 2', hint: 'Galería' },
    { key: 'image3', label: 'Imagen 3', hint: 'Galería' }
  ] as const;

  cerrar() {
    this.dialogRef.close();
  }

  /** Hay una foto nueva elegida (el control guarda el nombre del archivo actual mientras no se cambie). */
  esNueva(controlName: 'flyer' | 'image1' | 'image2' | 'image3'): boolean {
    return this.eventsForm.get(controlName)?.value instanceof File;
  }

  getPreviewSrc(controlName: 'flyer' | 'image1' | 'image2' | 'image3'): string | null {
    return this.previewUrls[controlName];
  }

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
  const cierreVenta = cierreVentaIso(fv.cierreFecha, fv.cierreHora);
  delete fv.cierreFecha;
  delete fv.cierreHora;
  if (cierreVenta) (fv as Record<string, unknown>)['cierreVenta'] = cierreVenta;
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


  // Las entradas necesitan el id del evento recién creado.
  this.eventsService.createEvent(fd).pipe(switchMap((ev: any) => this.entradas().guardar(ev.idEvents))).subscribe({
    next: () => {
      this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Evento creado correctamente.' });
      Object.values(this.previewUrls).forEach(url => { if (url && url.startsWith('blob:')) URL.revokeObjectURL(url); });
      this.dialogRef.close(true);
    },
    error: (err: any) => {
      console.error('Error al crear evento:', err);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message ?? 'No se pudo crear el evento.' });
    }
  });
}

  formateTimeString(time: string){
    
  }
}
