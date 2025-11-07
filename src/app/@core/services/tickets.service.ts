import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.developer';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TicketsService {
  private api: string = environment.api;
  private http = inject(HttpClient);

  getAllTickets(){
    return this.http.get(`${this.api}/tickets`).pipe(
      map((res: any) => {
        const items = res ?? [];

        const sorted = items.sort((a: any, b: any) => (b.idDrinks - a.idDrinks));
        return sorted.map((ticket: any) => ({ ...ticket }));
      }),
      catchError((error) => {
        console.error('Error al obtener los tickets:', error);
        return [];
      })
    )
  }

  createTicket(data: any){
    return this.http.post(`${this.api}/tickets`, data);
  }

  updateTicket(id: number, data: any){
    return this.http.put(`${this.api}/tickets/${id}`, data);
  }

}
