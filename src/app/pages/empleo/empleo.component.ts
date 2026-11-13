import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { MAX_CV_BYTES } from '../../@core/models/postulacion.model';
import { PostulacionesService } from '../../@core/services/postulaciones.service';
import { RevealDirective } from '../../shared/directives/reveal.directive';

/** "Trabaja con nosotros": formulario público de postulación. */
@Component({
  selector: 'app-empleo',
  imports: [DecimalPipe, ReactiveFormsModule, RouterLink, RevealDirective],
  templateUrl: './empleo.component.html',
  styleUrl: './empleo.component.scss'
})
export class EmpleoComponent implements OnInit {
  private service = inject(PostulacionesService);
  private messageService = inject(MessageService);

  /** Solo los puestos que el admin tiene abiertos; null mientras carga. */
  puestos = signal<string[] | null>(null);
  cv = signal<File | null>(null);
  errorCv = signal('');
  enviando = signal(false);
  enviada = signal(false);

  form = inject(FormBuilder).nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(50)]],
    apellido: ['', [Validators.required, Validators.maxLength(50)]],
    cedula: ['', [Validators.required, Validators.maxLength(13)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(80)]],
    telefono: ['', [Validators.required, Validators.maxLength(20)]],
    puesto: ['', Validators.required],
    mensaje: ['', Validators.maxLength(1000)]
  });

  ngOnInit() {
    this.service.puestos().subscribe({
      next: ({ abiertos }) => this.puestos.set(abiertos),
      error: () => this.puestos.set([])
    });
  }

  elegirCv(input: HTMLInputElement) {
    const file = input.files?.[0] ?? null;
    this.errorCv.set('');
    if (file && (file.type !== 'application/pdf' || file.size > MAX_CV_BYTES)) {
      this.errorCv.set(file.type !== 'application/pdf' ? 'El CV debe ser un PDF.' : 'El PDF pesa más de 500 KB.');
      input.value = '';
      this.cv.set(null);
      return;
    }
    this.cv.set(file);
  }

  invalido(campo: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[campo];
    return c.invalid && c.touched;
  }

  enviar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.service.enviar(this.form.getRawValue(), this.cv()).subscribe({
      next: () => {
        this.enviando.set(false);
        this.enviada.set(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: err => {
        this.enviando.set(false);
        const detalle =
          err?.status === 429 ? 'Enviaste varias postulaciones seguidas. Intenta de nuevo en unos minutos.'
          : err?.status === 413 ? 'El PDF pesa más de 500 KB.'
          : err?.error?.message;
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudo enviar',
          detail: Array.isArray(detalle) ? detalle.join(', ') : (detalle ?? 'Intenta de nuevo')
        });
      }
    });
  }
}
