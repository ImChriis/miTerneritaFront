import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.developer';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Subject, tap } from 'rxjs';
import { Ticket } from '../models/ticket.model';

@Injectable({
  providedIn: 'root'
})
export class TicketsService {
  private api: string = environment.api;
  private http = inject(HttpClient);
  private refreshTickets$ = new Subject<void>();
  public refreshTicketsObservable$ = this.refreshTickets$.asObservable();

  getTickets(){
    return this.http.get<Ticket[]>(`${this.api}/ticket`).pipe(
      map((tickets: Ticket[] = []) => {
        return tickets.map(ticket => ({
          ...ticket
        }));
      }),
      catchError((error) => {
        console.error('Error al obtener las entradas:', error);
        return [];
      })
    )
  }

  getTicktesByEvent(idEvents: number){
    return this.http.get<Ticket[]>(`${this.api}/ticket/event/${idEvents}`);
  }

  createTicket(data: any){
    return this.http.post(`${this.api}/ticket`, data).pipe(
      tap(() => this.refreshTickets$.next())
    )
  }

  updateTicket(id: number, data: any){
    return this.http.put(`${this.api}/ticket/${id}`, data).pipe(
      tap(() => this.refreshTickets$.next())
    );
  }

}
