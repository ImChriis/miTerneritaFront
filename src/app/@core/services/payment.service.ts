import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.developer';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, Subject, tap } from 'rxjs';

/** GET /payment/reporte/:idEvents: ventas cobradas del evento. */
export interface ReporteEvento {
  evento: { idEvents: number; nombre: string; fecha: string; hora: string; salon: string | null; categoria: string; capacidad: number; vendidas: number };
  entradas: { nombre: string; cantidad: number; total: number }[];
  consumo: { nombre: string; tipo: string; botella: boolean; cantidad: number; total: number }[];
  pagos: { estado: string; cantidad: number; total: number }[];
  totales: { entradas: number; consumo: number; general: number };
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private api: string = environment.api;
  private http = inject(HttpClient);
  private refreshPayments$ = new Subject<void>();
  public refreshPaymentsObservable$ = this.refreshPayments$.asObservable();

  getReporte(idEvents: number) {
    return this.http.get<ReporteEvento>(`${this.api}/payment/reporte/${idEvents}`);
  }

   getAllPayments(){
    return this.http.get<any[]>(`${this.api}/payment`).pipe(
      map((res: any[] = []) => {
        const items = res ?? [];
        const sorted = items.slice().sort((a: any, b: any) => (b.idPayment ?? 0) - (a.idPayment ?? 0));
        return sorted.map((payment: any) => ({ ...payment }));
      }),
      catchError((error) => {
        console.error('Error al obtener los pagos:', error);
        return of([]);
      })
    );
  }

  createPayment(data: any){
    return this.http.post(`${this.api}/payment`, data ).pipe(
      tap(() => this.refreshPayments$.next())
    );
  }

  updatePayment(id: number, body: any){
    return this.http.patch(`${this.api}/payment/${id}/status`, body).pipe(
      tap(() => this.refreshPayments$.next())
    )
  }

  getComprobante(id: number){
    return this.http.get(`${this.api}/payment/${id}/comprobante`, {
      responseType: 'blob'
    } );
  }

  getTasaDolarEuro() {
  return this.http.get<any[]>(`${environment.apiDolar}`).pipe(
    map((res: any[]) => {
      const tasaDolar = res?.[0]?.promedio ?? 0;
      return tasaDolar;
    }),
    catchError((error) => {
      console.error('Error al obtener la tasa de cambio:', error);
      return of(0);
    })
  );
}
}
