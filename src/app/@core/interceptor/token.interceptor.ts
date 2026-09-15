import { HttpInterceptorFn } from '@angular/common/http';
import { TokenService } from '../services/token.service';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment.developer';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
const tokenService = inject(TokenService);
  const token: string | null = tokenService.getToken();

  // 1. Verificar si la URL va dirigida a tu propio backend
  // O verificar si no es una API de terceros explícita como dolarapi
  const isApiUrl = req.url.startsWith(environment.api) || !req.url.startsWith('http');
  const isExternalApi = req.url.includes('dolarapi.com');

  // 2. Solo adjuntar el token si existe y la petición va hacia tu API
  if (token && isApiUrl && !isExternalApi) {
    req = req.clone({
      setHeaders: {
        authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req);
};
