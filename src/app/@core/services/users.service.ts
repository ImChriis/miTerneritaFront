import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.developer';
import { HttpClient } from '@angular/common/http';
import { Subject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private api: string = environment.api;
  private http = inject(HttpClient);
  private refreshUsers$ = new Subject<void>();
  public refreshUsersObservable$ = this.refreshUsers$.asObservable();

  getUsers(){
    return this.http.get(`${this.api}/users`).pipe(
      tap((u) => console.log('Users fetched:', u)),
    )
  }

  deleteUser(id: number){
    return this.http.delete(`${this.api}/users/${id}`).pipe(
      tap(() => {
        console.log(`User with ID ${id} deleted successfully.`);
        this.refreshUsers$.next(); // Notify subscribers to refresh the users list
      }),
    );
  }
}
