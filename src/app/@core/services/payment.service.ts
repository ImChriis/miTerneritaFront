import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.developer';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, Subject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private api: string = environment.api;
  private http = inject(HttpClient);
  private refreshPayments$ = new Subject<void>();
  public refreshPaymentsObservable$ = this.refreshPayments$.asObservable();

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
    return this.http.post(`${this.api}/payment`, data );
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
      console.log('Tasa de cambio obtenida:', tasaDolar);
      return tasaDolar;
    }),
    catchError((error) => {
      console.error('Error al obtener la tasa de cambio:', error);
      return of(0);
    })
  );
}
}
