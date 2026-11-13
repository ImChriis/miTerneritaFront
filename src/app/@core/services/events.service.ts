import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.developer';
import { catchError, map, Subject, tap } from 'rxjs';
import { Event, EventPhoto } from '../models/event.model';
import { MenuEvento } from '../models/menu.model';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private http = inject(HttpClient);
  private api: string = environment.api;
  private refreshEvents$ = new Subject<void>();
  public refreshEventsObservable$ = this.refreshEvents$.asObservable();

  /** Aparta entradas mientras se paga (aforo por evento); devuelve cuándo vence. */
  reservar(idEvents: number, cantidad: number) {
    return this.http.post<{ vence: string }>(`${this.api}/reservas`, { idEvents, cantidad });
  }

  /** Ids de eventos agotados (SOLD OUT). Público, sin cantidades. */
  agotados() {
    return this.http.get<number[]>(`${this.api}/reservas/agotados`);
  }

  /** Solo personal: cupo de cada evento. */
  disponibles() {
    return this.http.get<Record<number, { capacidad: number; vendidas: number; apartadas: number }>>(`${this.api}/reservas/disponibles`);
  }

  /** { [idEvents]: personas comprando ahora } */
  comprando() {
    return this.http.get<Record<number, number>>(`${this.api}/reservas/comprando`);
  }

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

  /** Comidas y bebidas que se pueden pre-ordenar con la entrada. */
  getMenu(id: number) {
    return this.http.get<MenuEvento>(`${this.api}/events/${id}/menu`);
  }

  /** Galería del evento. Pública. */
  getPhotos(id: number) {
    return this.http.get<EventPhoto[]>(`${this.api}/events/${id}/photos`);
  }

  /** Una tanda de fotos .webp (el backend acepta hasta 20 por petición). */
  uploadPhotos(id: number, files: File[]) {
    const fd = new FormData();
    files.forEach(f => fd.append('photos', f));
    return this.http.post<EventPhoto[]>(`${this.api}/events/${id}/photos`, fd);
  }

  deletePhoto(id: number, idPhoto: number) {
    return this.http.delete(`${this.api}/events/${id}/photos/${idPhoto}`);
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
