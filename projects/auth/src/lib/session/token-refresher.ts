import { inject, Injectable } from '@angular/core';
import { AuthApi, isApiError } from 'data-access';
import { defer, finalize, firstValueFrom, from, Observable, shareReplay } from 'rxjs';
import { SessionTokens } from './session-storage';
import { SessionStore } from './session.store';

/** Margen antes del vencimiento en que el access token ya se renueva. */
export const ACCESS_TOKEN_MARGIN_MS = 30_000;

const LOCK_NAME = 'itinerantes.session.refresh';

/** El access token vence (o vencerá dentro del margen). */
export const isAccessTokenExpiring = (tokens: SessionTokens, now = Date.now()): boolean =>
  Date.parse(tokens.accessTokenExpiresAt) - now <= ACCESS_TOKEN_MARGIN_MS;

/** Error cuando no hay forma de renovar: la sesión terminó. */
export class SessionExpiredError extends Error {
  override readonly name = 'SessionExpiredError';
}

/**
 * Renueva los tokens con `POST /auth/refresh`, una sola vez a la vez:
 *
 * - En la pestaña, las peticiones simultáneas comparten la misma renovación.
 * - Entre pestañas, un candado (Web Locks) evita dos renovaciones a la vez; la
 *   que llega después reutiliza los tokens que ya dejó la primera. La API
 *   revoca toda la sesión si se reusa un refresh token rotado.
 * - Si la API rechaza el refresh token, la sesión se cierra como expirada; si
 *   falla la red, la sesión se conserva para reintentar.
 */
@Injectable({ providedIn: 'root' })
export class TokenRefresher {
  private readonly api = inject(AuthApi);
  private readonly session = inject(SessionStore);
  private inFlight: Observable<string> | null = null;

  /**
   * Devuelve un access token válido distinto de `staleAccessToken` (el que
   * falló o está por vencer), renovando solo si hace falta.
   */
  refresh(staleAccessToken: string): Observable<string> {
    this.inFlight ??= defer(() => from(this.withLock(() => this.renew(staleAccessToken)))).pipe(
      finalize(() => (this.inFlight = null)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.inFlight;
  }

  private async renew(staleAccessToken: string): Promise<string> {
    const latest = this.session.latestTokens();
    if (!latest) {
      throw new SessionExpiredError('No hay sesión.');
    }
    // Otra pestaña (o una renovación anterior) ya dejó un token vigente.
    if (latest.accessToken !== staleAccessToken && !isAccessTokenExpiring(latest)) {
      return latest.accessToken;
    }
    if (Date.parse(latest.refreshTokenExpiresAt) <= Date.now()) {
      this.session.end('expired');
      throw new SessionExpiredError('La sesión venció.');
    }
    try {
      const pair = await firstValueFrom(this.api.refresh({ refreshToken: latest.refreshToken }));
      this.session.setTokens(pair);
      return pair.accessToken;
    } catch (error) {
      if (isApiError(error) && error.kind === 'http' && error.statusCode < 500) {
        this.session.end('expired');
      }
      throw error;
    }
  }

  /** Ejecuta en exclusiva entre pestañas cuando el navegador lo permite. */
  private withLock<T>(task: () => Promise<T>): Promise<T> {
    const locks = globalThis.navigator?.locks;
    return locks ? locks.request(LOCK_NAME, task) : task();
  }
}
