import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment.developer';

export interface Tasa {
  /** Bs por USD (tasa oficial BCV). 0 si no hay tasa. */
  valor: number;
  fecha: string | null;
}

/**
 * Tasa BCV del día. La actualiza el backend cada pocas horas; aquí se pide una
 * sola vez por sesión (la tasa cambia una vez al día) y se comparte.
 */
@Injectable({ providedIn: 'root' })
export class TasaService {
  private http = inject(HttpClient);

  readonly tasa$ = this.http.get<{ BCV?: string | number; fechaBCV?: string | null }>(`${environment.api}/configuration`).pipe(
    map(c => ({ valor: Number(c?.BCV) || 0, fecha: c?.fechaBCV ?? null }) as Tasa),
    catchError(() => of({ valor: 0, fecha: null } as Tasa)),
    shareReplay(1)
  );
  readonly tasa = toSignal(this.tasa$, { initialValue: null });

  /** Equivalente en Bs con 2 decimales, o null mientras no haya tasa. */
  bs(usd: number): number | null {
    const valor = this.tasa()?.valor;
    return valor ? Math.round(usd * valor * 100) / 100 : null;
  }
}
