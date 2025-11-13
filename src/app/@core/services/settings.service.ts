import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.developer';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private api: string = environment.api;
  private http = inject(HttpClient);

  getSettings() {
    return this.http.get(`${this.api}/configuration`);
  }

  updateSettings(settings: any) {
    return this.http.put(`${this.api}/configuration`, settings);
  }
}
