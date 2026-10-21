import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { Role, UserProfileDto } from 'data-access';
import { SESSION_STORAGE, SessionTokens } from './session-storage';

/** Motivo del fin de la sesión, para que la app decida qué mostrar. */
export type SessionEndReason = 'logout' | 'expired';

/**
 * Estado de la sesión con signals: tokens, usuario y roles. Persiste los
 * tokens; el usuario se obtiene de la API (login o `GET /me`).
 */
@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly storage = inject(SESSION_STORAGE);

  private readonly tokensState = signal<SessionTokens | null>(this.storage.read());
  private readonly userState = signal<UserProfileDto | null>(null);
  private readonly endedState = signal<SessionEndReason | null>(null);

  readonly tokens = this.tokensState.asReadonly();
  readonly user = this.userState.asReadonly();
  /** Último motivo de cierre (se limpia al iniciar sesión). */
  readonly ended = this.endedState.asReadonly();

  readonly isAuthenticated = computed(() => this.tokensState() !== null);
  readonly roles = computed<readonly Role[]>(() => this.userState()?.roles ?? []);

  constructor() {
    // Sincroniza la sesión entre pestañas: una renovación hecha en otra pestaña
    // reemplaza los tokens aquí (evita reusar un refresh token ya rotado, que la
    // API castiga revocando la sesión) y un cierre allí la cierra aquí.
    const unwatch = this.storage.watch?.((tokens) => {
      if (tokens) {
        this.tokensState.set(tokens);
      } else if (this.tokensState()) {
        this.tokensState.set(null);
        this.userState.set(null);
        this.endedState.set('logout');
      }
    });
    if (unwatch) {
      inject(DestroyRef).onDestroy(unwatch);
    }
  }

  hasAnyRole(roles: readonly Role[]): boolean {
    const own = this.roles();
    return roles.some((role) => own.includes(role));
  }

  /** Inicia la sesión con la respuesta del login. */
  start(tokens: SessionTokens & { readonly expiresIn?: number }, user: UserProfileDto): void {
    this.setTokens(tokens);
    this.userState.set(user);
    this.endedState.set(null);
  }

  /**
   * Guarda tokens nuevos. Con `expiresIn` (respuesta de login o refresh), el
   * vencimiento del access token se calcula con el reloj local, para que un
   * reloj desfasado no provoque renovaciones de más ni de menos.
   */
  setTokens(tokens: SessionTokens & { readonly expiresIn?: number }): void {
    const value: SessionTokens = {
      accessToken: tokens.accessToken,
      accessTokenExpiresAt:
        tokens.expiresIn !== undefined
          ? new Date(Date.now() + tokens.expiresIn * 1000).toISOString()
          : tokens.accessTokenExpiresAt,
      refreshToken: tokens.refreshToken,
      refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
    };
    this.tokensState.set(value);
    this.storage.write(value);
  }

  setUser(user: UserProfileDto | null): void {
    this.userState.set(user);
  }

  /** Tokens más recientes del almacenamiento (pueden venir de otra pestaña). */
  latestTokens(): SessionTokens | null {
    const stored = this.storage.read();
    if (stored && stored.accessToken !== this.tokensState()?.accessToken) {
      this.tokensState.set(stored);
    }
    return stored ?? this.tokensState();
  }

  /** Cierra la sesión localmente (no llama a la API). */
  end(reason: SessionEndReason): void {
    this.tokensState.set(null);
    this.userState.set(null);
    this.storage.clear();
    this.endedState.set(reason);
  }
}
