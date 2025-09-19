import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.developer';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { tap } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api: string = environment.api;
  private http = inject(HttpClient);

  login(body: Partial<User>){
    return this.http.post<User>(`${this.api}/auth/login`, body).pipe(
      tap((user: User) => {
        localStorage.setItem('token', user.token || ''),
        localStorage.setItem('user', JSON.stringify(user));
      })
    )
  }

  register(body: Partial<User>){
    return this.http.post<User>(`${this.api}/auth/register`, body);
  }
}
