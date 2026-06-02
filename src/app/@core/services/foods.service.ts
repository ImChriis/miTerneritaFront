import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.developer';
import { Subject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FoodsService {
  private http = inject(HttpClient);
  private api: string = environment.api;
  private refreshFoods$ = new Subject<void>();
  public refreshFoodsObservable$ = this.refreshFoods$.asObservable();

  getAllFoods(){
    return this.http.get(`${this.api}/food`);
  }

  createFood(data: any){
    return this.http.post(`${this.api}/food`, data).pipe(
      tap(() => this.refreshFoods$.next()),
    )
  }

  updateFood(idFoods: number, data: any){
    return this.http.put(`${this.api}/food/${idFoods}`, data).pipe(
      tap(() => this.refreshFoods$.next()),
    );
  }

  updateFoodJson(idFoods: number, data: any) {
    return this.http.put(`${this.api}/food/${idFoods}`, data).pipe(
      tap(() => this.refreshFoods$.next()),
    )
  }
}
