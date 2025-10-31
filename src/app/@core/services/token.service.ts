import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  getToken(){
    const token = localStorage.getItem('token');

    return token
  }

  setToken(token: string){
    localStorage.setItem('token', token);
  }

  deleteToken(){
    localStorage.removeItem('token');
  }
}
