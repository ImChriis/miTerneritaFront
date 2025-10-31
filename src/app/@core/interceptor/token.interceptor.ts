import { HttpInterceptorFn } from '@angular/common/http';
import { TokenService } from '../services/token.service';
import { inject } from '@angular/core';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const token: string = tokenService.getToken() || '';

  if(token){
    req = req.clone({
      setHeaders: {
        authorization: `Bearer ${token}`
      }
    })
  }

  return next(req);
};
