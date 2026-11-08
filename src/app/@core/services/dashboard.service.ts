import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.developer';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private api: string = environment.api;
  private http = inject(HttpClient);

  getTotalUsers(){
    return this.http.get(`${this.api}/users`);
  }
}
