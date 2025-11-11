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
   status = [
    { label: 'Disponible', value: 1 },
    { label: 'No Disponible', value: 0 }
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
    status: new FormControl<number | null>(1, { nonNullable: true })
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

  onSubmit(){
    const fv = this.updateEventsForm.value;
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

    this.eventsService.updateEvent(this.event.idEvents, fd).subscribe({
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
