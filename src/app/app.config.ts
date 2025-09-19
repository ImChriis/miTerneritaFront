import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions, } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { DialogService } from "primeng/dynamicdialog";
import { providePrimeNG } from 'primeng/config';
import Material from '@primeng/themes/material';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(),
    provideAnimationsAsync(),
    MessageService,
    DialogService,
    providePrimeNG({
      theme: {
        preset: Material
      }
    })
  ]
};


