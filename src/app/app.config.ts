import { ApplicationConfig, Injectable, LOCALE_ID, provideZoneChangeDetection, Type } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEsVe from '@angular/common/locales/es-VE';
import { provideRouter, TitleStrategy, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeng/themes';
import Material from '@primeng/themes/material';
import { tokenInterceptor } from './@core/interceptor/token.interceptor';
import { loadingInterceptor } from './@core/services/loading.service';
import { PageTitleStrategy } from './@core/services/page-title.strategy';

registerLocaleData(localeEsVe);

/** Todos los modales se cierran al tocar fuera de ellos, salvo que la llamada diga otra cosa. */
@Injectable()
class DialogServiceCerrable extends DialogService {
  override open<T>(componentType: Type<T>, config: DynamicDialogConfig): DynamicDialogRef<T> {
    return super.open(componentType, { dismissableMask: true, ...config });
  }
}

// Paleta de PrimeNG alineada con los tokens de src/styles/_tokens.scss
const TerneritaPreset = definePreset(Material, {
  semantic: {
    primary: {
      50: '#eef1ff',
      100: '#e0e6ff',
      200: '#c6d0ff',
      300: '#a3b2ff',
      400: '#7891ff',
      500: '#5b7cff',
      600: '#3f5ff0',
      700: '#2f54eb',
      800: '#2445cf',
      900: '#1e3ab0',
      950: '#141f5c'
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#f6f4ef',
          100: '#f3f0e9',
          200: '#e8e4da',
          300: '#d6d1c5',
          400: '#a9a49a',
          500: '#8a867f',
          600: '#57544e',
          700: '#3f3d39',
          800: '#2a2926',
          900: '#16151a',
          950: '#0a0a0c'
        },
        primary: {
          color: '{primary.700}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.800}',
          activeColor: '{primary.900}'
        }
      },
      dark: {
        surface: {
          0: '#ffffff',
          50: '#f5f2ec',
          100: '#e4e1db',
          200: '#c9c6c0',
          300: '#aaa7a2',
          400: '#77756f',
          500: '#4a4952',
          600: '#33323b',
          700: '#262630',
          800: '#1c1c23',
          900: '#15151a',
          950: '#0a0a0c'
        },
        primary: {
          color: '{primary.500}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.400}',
          activeColor: '{primary.300}'
        }
      }
    }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withViewTransitions({
        skipInitialTransition: true,
        // Una navegacion que interrumpe a otra cancela la transicion: es normal, no un error de consola.
        onViewTransitionCreated: ({ transition }) => {
          for (const p of [transition.ready, transition.finished, transition.updateCallbackDone]) p.catch(() => {});
        }
      }),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })
    ),
    provideHttpClient(withInterceptors([tokenInterceptor, loadingInterceptor])),
    provideAnimationsAsync(),
    { provide: LOCALE_ID, useValue: 'es-VE' },
    { provide: TitleStrategy, useExisting: PageTitleStrategy },
    MessageService,
    { provide: DialogService, useClass: DialogServiceCerrable },
    providePrimeNG({
      theme: {
        preset: TerneritaPreset,
        options: {
          // ThemeService agrega/quita esta clase en <html>
          darkModeSelector: '.app-dark'
        }
      }
    })
  ]
};
