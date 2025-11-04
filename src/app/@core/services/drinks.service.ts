import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.developer';
import { catchError, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DrinksService {
  private http = inject(HttpClient);
  private api: string = environment.api;

  getAllDrinks(){
    return this.http.get(`${this.api}/drinks`).pipe(
      map((res: any) => {
        const items = res ?? [];

        const sorted = items.sort((a: any, b: any) => (b.idDrinks - a.idDrinks));
        return sorted.map((drink: any) => ({ ...drink }));
        console.log('Bebidas obtenidas:', sorted);
      }),
      catchError((error) => {
        console.error('Error al obtener las bebidas:', error);
        return [];
      })
    )
  }

  createDrink(data: any){
    return this.http.post(`${this.api}/drinks`, data);
  }

  updateDrink(id: number, data: any){
    return this.http.put(`${this.api}/drinks/${id}`, data);
  }

  updateDrinkJson(id: number, data: any) {
    return this.http.put(`${this.api}/drinks/${id}`, data);
  }
}
  

