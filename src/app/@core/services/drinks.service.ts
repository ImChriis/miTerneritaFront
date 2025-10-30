import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.developer';

@Injectable({
  providedIn: 'root'
})
export class DrinksService {
  private http = inject(HttpClient);
  private api: string = environment.api;

  createDrink(data: any){
    return this.http.post(`${this.api}/drinks`, data);
  }
}
  

