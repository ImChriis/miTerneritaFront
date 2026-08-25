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

  getNewUsers(){
    return this.http.get(`${this.api}/users/new-today`);
  }

  getTotalInvoices(){
    return this.http.get(`${this.api}/payment`);
  }

  getTotalTickets(){
    return this.http.get(`${this.api}/payment-details/totals/general`);
  }
}
