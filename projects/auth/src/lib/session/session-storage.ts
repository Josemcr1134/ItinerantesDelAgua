import { InjectionToken } from '@angular/core';

/** Tokens de la sesión tal como los devuelve la API (login / refresh). */
export interface SessionTokens {
  readonly accessToken: string;
  readonly accessTokenExpiresAt: string;
  readonly refreshToken: string;
  readonly refreshTokenExpiresAt: string;
}

/** Dónde se guardan los tokens; por defecto `localStorage`. */
export interface SessionStorage {
  read(): SessionTokens | null;
  write(tokens: SessionTokens): void;
  clear(): void;
}

const KEY = 'itinerantes.session';

const isTokens = (value: unknown): value is SessionTokens =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as SessionTokens).accessToken === 'string' &&
  typeof (value as SessionTokens).refreshToken === 'string';

/** Almacenamiento en `localStorage`, tolerante a navegación privada o SSR. */
export const localSessionStorage: SessionStorage = {
  read() {
    try {
      const raw = globalThis.localStorage?.getItem(KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : null;
      return isTokens(parsed) ? parsed : null;
    } catch {
      return null;
    }
  },
  write(tokens) {
    try {
      globalThis.localStorage?.setItem(KEY, JSON.stringify(tokens));
    } catch {
      // Sin almacenamiento disponible: la sesión dura lo que la pestaña.
    }
  },
  clear() {
    try {
      globalThis.localStorage?.removeItem(KEY);
    } catch {
      // Nada que limpiar.
    }
  },
};

export const SESSION_STORAGE = new InjectionToken<SessionStorage>('SESSION_STORAGE', {
  factory: () => localSessionStorage,
});
