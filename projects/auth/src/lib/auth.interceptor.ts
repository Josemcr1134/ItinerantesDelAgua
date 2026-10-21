import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_BASE_URL, isApiError, PUBLIC_REQUEST } from 'data-access';
import { catchError, switchMap, throwError } from 'rxjs';
import { SessionStore } from './session/session.store';
import { isAccessTokenExpiring, TokenRefresher } from './session/token-refresher';

const isUnauthorized = (error: unknown): boolean =>
  (isApiError(error) && error.statusCode === 401) ||
  (error instanceof HttpErrorResponse && error.status === 401);

const withToken = (req: HttpRequest<unknown>, token: string) =>
  req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

/** Solo las peticiones a nuestra API llevan el token (nunca a otros dominios). */
const isApiRequest = (url: string, baseUrl: string): boolean =>
  baseUrl ? url.startsWith(`${baseUrl}/`) : url.startsWith('/') && !url.startsWith('//');

/**
 * Adjunta el token de acceso a las rutas protegidas de la API y lo mantiene
 * vigente:
 *
 * 1. Si el access token vence en menos de 30 s, lo renueva antes de enviar.
 * 2. Si aun así la API responde 401, renueva y reintenta una sola vez.
 *
 * Las renovaciones se coordinan en `TokenRefresher` (una a la vez, también
 * entre pestañas). Si la sesión no se puede renovar, se cierra como expirada
 * y la petición falla con su 401 original.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (
    req.context.get(PUBLIC_REQUEST) ||
    !isApiRequest(req.url, inject(API_BASE_URL, { optional: true }) ?? '')
  ) {
    return next(req);
  }
  const session = inject(SessionStore);
  const refresher = inject(TokenRefresher);
  const tokens = session.latestTokens();
  if (!tokens) {
    return next(req);
  }

  const send = (accessToken: string) =>
    next(withToken(req, accessToken)).pipe(
      catchError((error: unknown) => {
        if (!isUnauthorized(error)) {
          return throwError(() => error);
        }
        return refresher.refresh(accessToken).pipe(
          switchMap((fresh) => next(withToken(req, fresh))),
          // Si no se pudo renovar, se propaga el 401 original de la petición.
          catchError((retryError: unknown) =>
            throwError(() => (session.isAuthenticated() ? retryError : error)),
          ),
        );
      }),
    );

  return isAccessTokenExpiring(tokens)
    ? refresher.refresh(tokens.accessToken).pipe(switchMap(send))
    : send(tokens.accessToken);
};
