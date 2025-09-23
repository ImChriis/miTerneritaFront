import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.developer';
import { map } from 'rxjs';
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
      })
    );
  }
}
