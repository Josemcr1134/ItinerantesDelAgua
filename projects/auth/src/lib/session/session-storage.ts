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
  /**
   * Avisa cuando otra pestaña cambia los tokens (renovación, login o cierre).
   * Devuelve la función para dejar de escuchar.
   */
  watch?(listener: (tokens: SessionTokens | null) => void): () => void;
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
  watch(listener) {
    // El evento `storage` solo llega a las demás pestañas del mismo origen.
    const onStorage = (event: StorageEvent) => {
      if (event.key === KEY || event.key === null) {
        listener(this.read());
      }
    };
    globalThis.addEventListener?.('storage', onStorage);
    return () => globalThis.removeEventListener?.('storage', onStorage);
  },
};

export const SESSION_STORAGE = new InjectionToken<SessionStorage>('SESSION_STORAGE', {
  factory: () => localSessionStorage,
});
