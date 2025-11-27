import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.developer';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private api: string = environment.api;
  private http = inject(HttpClient);

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
    return this.http.post(`${this.api}/payment`, data);
  }

  updatePayment(id: number, body: any){
    return this.http.put(`${this.api}/payment/${id}/status`, body);
  }
}
