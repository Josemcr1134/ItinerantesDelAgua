import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthApi, isApiError, PUBLIC_REQUEST } from 'data-access';
import { catchError, finalize, map, Observable, shareReplay, switchMap, throwError } from 'rxjs';
import { SessionStore } from './session/session.store';

/** Renovación en curso, compartida entre peticiones simultáneas. */
let refreshing: Observable<string> | null = null;

const isUnauthorized = (error: unknown): boolean =>
  (isApiError(error) && error.statusCode === 401) ||
  (error instanceof HttpErrorResponse && error.status === 401);

const withToken = (req: HttpRequest<unknown>, token: string) =>
  req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

/**
 * Adjunta el token de acceso a las rutas protegidas. Si la API responde 401,
 * renueva los tokens una sola vez (aunque fallen varias peticiones a la vez) y
 * reintenta; si la renovación falla, cierra la sesión como expirada.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(PUBLIC_REQUEST)) {
    return next(req);
  }
  const session = inject(SessionStore);
  const authApi = inject(AuthApi);
  const tokens = session.tokens();
  if (!tokens) {
    return next(req);
  }

  return next(withToken(req, tokens.accessToken)).pipe(
    catchError((error: unknown) => {
      const refreshToken = session.tokens()?.refreshToken;
      if (!isUnauthorized(error) || !refreshToken) {
        return throwError(() => error);
      }
      refreshing ??= authApi.refresh({ refreshToken }).pipe(
        map((pair) => {
          session.setTokens(pair);
          return pair.accessToken;
        }),
        catchError((refreshError: unknown) => {
          session.end('expired');
          return throwError(() => refreshError);
        }),
        finalize(() => (refreshing = null)),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
      return refreshing.pipe(
        switchMap((accessToken) => next(withToken(req, accessToken))),
        // Si la renovación falló, se propaga el 401 original de la petición.
        catchError((retryError: unknown) =>
          throwError(() => (session.isAuthenticated() ? retryError : error)),
        ),
      );
    }),
  );
};
