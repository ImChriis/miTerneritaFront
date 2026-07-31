import { Component, inject, OnInit } from '@angular/core';
import { SettingsService } from '../../@core/services/settings.service';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormSettings } from '../../@core/models/forms/form-settings';
import { InputText } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';


@Component({
  selector: 'app-settings',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputText,
    ButtonModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit{
  private settingsService = inject(SettingsService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  updateSettingsForm: FormGroup<FormSettings> = this.fb.group({
    email: new FormControl('', { nonNullable: true }),
    phone: new FormControl('', { nonNullable: true }),
    instagram: new FormControl('', { nonNullable: true }),
    BCV: new FormControl<number | null>(null),
    tasaDolar: new FormControl<number | null>(null)
  })

  ngOnInit() {
    this.settingsService.getSettings().subscribe({
      next: (settings) => {
        this.updateSettingsForm.patchValue(settings);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  onlyNumberInput(event: any) {
    const input = event.target as HTMLInputElement;

    input.value = input.value.replace(/[^0-9.,]/g, ''); 
  }

onSubmit() {
  const formValues = {
    ...this.updateSettingsForm.value,
    BCV: this.updateSettingsForm.value.BCV !== null ? Number(this.updateSettingsForm.value.BCV) : null,
    tasaDolar: this.updateSettingsForm.value.tasaDolar !== null ? Number(this.updateSettingsForm.value.tasaDolar) : null
  };

  console.log(formValues);

  this.settingsService.updateSettings(formValues).subscribe({
    next: (response) => {
      this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Configuración actualizada correctamente' });
    },
    error: (error) => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar la configuración' });
    }
  });
}
}
