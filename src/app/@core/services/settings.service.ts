import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.developer';
import { HttpClient } from '@angular/common/http';
import { Subject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private api: string = environment.api;
  private http = inject(HttpClient);
  private refresh$ = new Subject<void>();
  public refreshObservable$ = this.refresh$.asObservable();

  getSettings() {
    return this.http.get(`${this.api}/configuration`);
  }

  updateSettings(settings: any) {
    return this.http.put(`${this.api}/configuration`, settings).pipe(
      tap(() => this.refresh$.next())
    )
  }
}
