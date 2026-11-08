import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, filter, map, of, take, tap } from 'rxjs';
import { environment } from '../../../environments/environment.developer';

export interface Tasa {
  /** Bs por USD (tasa oficial BCV). 0 si no hay tasa. */
  valor: number;
  fecha: string | null;
}

type Config = { BCV?: string | number; fechaBCV?: string | null };
const aTasa = (c: Config | null): Tasa => ({ valor: Number(c?.BCV) || 0, fecha: c?.fechaBCV ?? null });

/**
 * Tasa BCV del día. La actualiza el backend cada pocas horas; aquí se pide una
 * sola vez por sesión (la tasa cambia una vez al día) y se comparte. El botón
 * del dashboard la refresca a mano con refrescar().
 */
@Injectable({ providedIn: 'root' })
export class TasaService {
  private http = inject(HttpClient);
  private readonly actual = signal<Tasa | null>(null);

  readonly tasa = this.actual.asReadonly();
  /** Primera tasa disponible (o la refrescada, si ya se refrescó). Emite una vez. */
  readonly tasa$ = toObservable(this.actual).pipe(
    filter((t): t is Tasa => t !== null),
    take(1)
  );

  constructor() {
    this.http
      .get<Config>(`${environment.api}/configuration`)
      .pipe(map(aTasa), catchError(() => of(aTasa(null))))
      .subscribe(t => this.actual.set(t));
  }

  /** Pide al backend la tasa del BCV ahora mismo. */
  refrescar() {
    return this.http.post<Config>(`${environment.api}/configuration/tasa-bcv`, {}).pipe(
      map(aTasa),
      tap(t => this.actual.set(t))
    );
  }

  /** Equivalente en Bs con 2 decimales, o null mientras no haya tasa. */
  bs(usd: number): number | null {
    const valor = this.tasa()?.valor;
    return valor ? Math.round(usd * valor * 100) / 100 : null;
  }
}
