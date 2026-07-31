import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from '../../@core/services/settings.service';

@Component({
  selector: 'app-contact',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit {
  private fb = inject(FormBuilder);
  private settingsService = inject(SettingsService);
  whatsapp!: string;
  instagram!: string;
  tiktok!: string;

  private phone = "584146416366";

  ngOnInit() {
    this.settingsService.getSettings().subscribe((data: any) => {
      console.log('Settings data:', data);
      this.whatsapp = data?.whatsapp;
      this.instagram = data?.instagram;
      this.tiktok = data?.tiktok;
    });
  }

  whatsappForm = this.fb.group({
    nombre: [''],
    apellido: [''],
    mensaje: ['']
  });

  sendMessage() {
if (this.whatsappForm.invalid) {
      this.whatsappForm.markAllAsTouched();
      return;
    }

    const { nombre, apellido, mensaje } = this.whatsappForm.value;

    const textoMensaje = `Nombre: ${nombre}%0AApellido: ${apellido}%0A ${mensaje}`;
    
    const url = `https://wa.me/${this.phone}?text=${textoMensaje}`;

    window.open(url, '_blank');
  
    this.whatsappForm.reset();
  }
}
