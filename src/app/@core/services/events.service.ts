import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.developer';
import { catchError, map, Subject, tap } from 'rxjs';
import { Event } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private http = inject(HttpClient);
  private api: string = environment.api;
  private refreshEvents$ = new Subject<void>();
  public refreshEventsObservable$ = this.refreshEvents$.asObservable();

  getEvents() {
    return this.http.get<Event[]>(`${this.api}/events`).pipe(
      map((events: Event[]) => {
        return events.map(event => ({
          ...event,
        }));
      }),
      catchError((error) => {
        console.error('Error al obtener los eventos:', error);
        return [];
      })
    );
  }

  getEventById(id: number) {
    return this.http.get<Event>(`${this.api}/events/${id}`).pipe(
      catchError((error) => {
        console.error(`Error al obtener el evento con ID ${id}:`, error);
        throw error;
      })
    );
  }

  createEvent(data: any){
    return this.http.post(`${this.api}/events`, data).pipe(
      tap(() => this.refreshEvents$.next())
    )
  }

  updateEvent(id: number, data: any){
    return this.http.put(`${this.api}/events/${id}`, data).pipe(
      tap(() => this.refreshEvents$.next())
    );
  }

  updateEventJson(id: number, data: any){
    return this.http.put(`${this.api}/events/${id}`, data).pipe(
      tap(() => this.refreshEvents$.next())
    );
  }

  deleteEvent(id: number){
    return this.http.delete(`${this.api}/events/${id}`).pipe(
      tap(() => this.refreshEvents$.next())
    );
  }
}
