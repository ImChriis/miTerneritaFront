import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.developer';
import { catchError, map } from 'rxjs';
import { Event } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private http = inject(HttpClient);
  private api: string = environment.api;

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

  createEvent(data: any){
    return this.http.post(`${this.api}/events`, data);
  }
}
