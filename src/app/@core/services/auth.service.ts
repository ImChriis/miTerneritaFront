import { computed, inject, Injectable, signal } from '@angular/core';
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

  private token = signal<string | null>(localStorage.getItem('token'));

  private readonly _setupStorageListener = (() => {
    window.addEventListener('storage', (event: StorageEvent) => {
      if (event.key === 'token') {
        this.token.set(localStorage.getItem('token'));
      }
    });
    return true;
  });

  isAuthenticated = computed(() => {
    const t = this.token(); 
     return !!t && !this.isTokenExpired(t);
  })

  login(body: Partial<User>){
    return this.http.post<User>(`${this.api}/auth/login`, body).pipe(
      tap((user: User) => {
        console.log('User logged in:', user);
        const tok= user.access_token ?? null;
        localStorage.setItem('token', user.access_token || ''),
        localStorage.setItem('user', JSON.stringify(user));
        this.token.set(tok);
      })
    )
  }

  register(body: Partial<User>){
    return this.http.post<User>(`${this.api}/auth/register`, body);
  }

  logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.token.set(null);
  }

  getToken(){
    return this.token();
  }

  getUser(): User | null {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) as User : null;
  }

   private isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (!payload.exp) return false;
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch {
      return true;
    }
  }

  editProfile(id: number, body: Partial<User>){
    return this.http.put<User>(`${this.api}/users/${id}`, body);
  }

  forgotPassword(body: any) {
    return this.http.post(`${this.api}/auth/forgot-password`, body);
  }

  resetPassword(body: any) {
    return this.http.post(`${this.api}/auth/reset-password`, body);
  }
}
