import { DOCUMENT } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';

/**
 * Peticiones a la API en curso. Lo alimenta loadingInterceptor y lo usan la
 * barra de progreso global (app-loader) y la clase `is-saving` de <html>, que
 * pone spinner y bloquea los botones de enviar mientras se guarda algo: así un
 * doble toque no crea pagos o eventos duplicados.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  /** Todas las peticiones (también las de lectura). */
  readonly pending = signal(0);
  /** Solo las que guardan: POST, PUT, PATCH, DELETE. */
  readonly saving = signal(0);

  constructor() {
    const html = inject(DOCUMENT).documentElement;
    effect(() => html.classList.toggle('is-saving', this.saving() > 0));
  }
}

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);
  const guarda = req.method !== 'GET' && req.method !== 'HEAD';
  loading.pending.update(n => n + 1);
  if (guarda) loading.saving.update(n => n + 1);
  return next(req).pipe(
    finalize(() => {
      loading.pending.update(n => n - 1);
      if (guarda) loading.saving.update(n => n - 1);
    })
  );
};
