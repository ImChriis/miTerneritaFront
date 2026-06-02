import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.developer';
import { catchError, map, Subject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DrinksService {
  private http = inject(HttpClient);
  private api: string = environment.api;
  private refreshDrinks$ = new Subject<void>();
  public refreshDrinksObservable$ = this.refreshDrinks$.asObservable();

  getAllDrinks(){
    return this.http.get(`${this.api}/drinks`)
    .pipe(
      map((res: any) => {
        const items = res ?? [];

        const sorted = items.sort((a: any, b: any) => (b.idDrinks - a.idDrinks));
        return sorted.map((drink: any) => ({ ...drink }));
      }),
      catchError((error) => {
        console.error('Error al obtener las bebidas:', error);
        return [];
      })
    )
  }

  createDrink(data: any){
    return this.http.post(`${this.api}/drinks`, data).pipe(
      tap(() => this.refreshDrinks$.next()),
    )
  }

  updateDrink(id: number, data: any){
    return this.http.put(`${this.api}/drinks/${id}`, data).pipe(
      tap(() => this.refreshDrinks$.next()),
    );
  }

  updateDrinkJson(id: number, data: any) {
    return this.http.put(`${this.api}/drinks/${id}`, data).pipe(
      tap(() => this.refreshDrinks$.next()),
    )
  }
}
  

