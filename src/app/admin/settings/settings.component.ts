import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { InputText } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SettingsService } from '../../@core/services/settings.service';
import { BANKS } from '../../pages/payment/payment.component';

type Seccion = 'general' | 'pagos';

/** Configuración del sitio: datos generales y cuentas que reciben los pagos. */
@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, InputText, SelectModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder).nonNullable;

  readonly bancos = BANKS.map(b => b.label);
  guardando = signal<Seccion | null>(null);

  general = this.fb.group({
    email: ['', Validators.email],
    phone: [''],
    instagram: [''],
    BCV: [null as number | null, Validators.min(0)]
  });

  pagos = this.fb.group({
    pmBanco: [''],
    pmCedula: [''],
    pmTelefono: [''],
    zelleTitular: [''],
    zelleTelefono: [''],
    zelleCorreo: ['', Validators.email]
  });

  ngOnInit() {
    this.settingsService.getSettings().subscribe(settings => {
      this.general.patchValue(settings as never);
      this.pagos.patchValue(settings as never);
    });
  }

  invalido(form: FormGroup, campo: string): boolean {
    const c = form.get(campo);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  guardar(seccion: Seccion) {
    const form: FormGroup = seccion === 'general' ? this.general : this.pagos;
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }
    // Vacío = sin dato (null), así un correo borrado no falla la validación.
    const datos = Object.fromEntries(
      Object.entries(form.getRawValue()).map(([k, v]) => [k, v === '' || v === null ? null : k === 'BCV' ? Number(v) : String(v).trim()])
    );
    this.guardando.set(seccion);
    this.settingsService.updateSettings(datos).subscribe({
      next: () => {
        this.guardando.set(null);
        form.markAsPristine();
        this.messageService.add({ severity: 'success', summary: seccion === 'general' ? 'Configuración guardada' : 'Datos de pago guardados' });
      },
      error: err => {
        this.guardando.set(null);
        const detalle = err?.error?.message;
        this.messageService.add({ severity: 'error', summary: 'No se pudo guardar', detail: Array.isArray(detalle) ? detalle.join(', ') : detalle });
      }
    });
  }
}
