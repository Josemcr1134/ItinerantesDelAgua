import { effect, inject, Injectable, untracked } from '@angular/core';
import { Router } from '@angular/router';
import {
  ApiError,
  AuthApi,
  isApiError,
  LoginRequestDto,
  ProfileApi,
  UserProfileDto,
} from 'data-access';
import { catchError, firstValueFrom, map, Observable, of, switchMap, throwError } from 'rxjs';
import { AUTH_CONFIG } from './auth.config';
import { SessionStore } from './session/session.store';

const ACCESS_DENIED_MESSAGE =
  'Tu cuenta no tiene acceso a esta plataforma. Si crees que es un error, contacta al equipo.';

/**
 * Casos de uso de la sesión: iniciar y cerrar sesión, recuperar el usuario al
 * recargar y comprobar el acceso por rol. Al expirar la sesión, lleva al login
 * conservando la página actual para volver después.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(AuthApi);
  private readonly profile = inject(ProfileApi);
  private readonly session = inject(SessionStore);
  private readonly config = inject(AUTH_CONFIG);
  private readonly router = inject(Router);
  private pendingUser: Promise<UserProfileDto | null> | null = null;

  constructor() {
    // Al expirar la sesión (o cerrarla en otra pestaña) se vuelve al login;
    // si expiró, se conserva la página para regresar después.
    effect(() => {
      const reason = this.session.ended();
      if (!reason) {
        return;
      }
      untracked(() => {
        const url = this.router.url;
        const { loginUrl, forgotPasswordUrl } = this.config;
        if (url.startsWith(loginUrl) || url.startsWith(forgotPasswordUrl)) {
          return;
        }
        void this.router.navigate([loginUrl], {
          queryParams: reason === 'expired' ? { returnUrl: url } : {},
        });
      });
    });
  }

  /** La cuenta tiene alguno de los roles con acceso a esta app. */
  canAccess(user: UserProfileDto): boolean {
    const allowed = this.config.allowedRoles;
    return !allowed || user.roles.some((role) => allowed.includes(role));
  }

  /**
   * Inicia sesión. Si la cuenta no tiene acceso a esta app, revoca la sesión
   * recién creada y falla con `FORBIDDEN`.
   */
  login(credentials: LoginRequestDto): Observable<UserProfileDto> {
    return this.api.login(credentials).pipe(
      switchMap((response) => {
        if (this.canAccess(response.user)) {
          this.session.start(response, response.user);
          return of(response.user);
        }
        return this.api.logout({ refreshToken: response.refreshToken }).pipe(
          catchError(() => of(null)),
          switchMap(() =>
            throwError(() => new ApiError('http', 403, 'FORBIDDEN', ACCESS_DENIED_MESSAGE)),
          ),
        );
      }),
    );
  }

  /** Cierra la sesión (local y en la API) y vuelve al login. */
  async logout(): Promise<void> {
    const tokens = this.session.tokens();
    this.session.end('logout');
    if (tokens) {
      this.api.logout({ refreshToken: tokens.refreshToken }).subscribe({ error: () => undefined });
    }
    await this.router.navigateByUrl(this.config.loginUrl);
  }

  /**
   * Devuelve el usuario de la sesión, pidiéndolo a la API si hay tokens
   * guardados (p. ej. tras recargar). `null` si no hay sesión válida.
   */
  ensureUser(): Promise<UserProfileDto | null> {
    const current = this.session.user();
    if (current) {
      return Promise.resolve(current);
    }
    if (!this.session.isAuthenticated()) {
      return Promise.resolve(null);
    }
    this.pendingUser ??= firstValueFrom(
      this.profile.me().pipe(
        map((user) => {
          if (!this.canAccess(user)) {
            this.session.end('logout');
            return null;
          }
          this.session.setUser(user);
          return user;
        }),
        catchError((error: unknown) => {
          // Sin conexión se conservan los tokens para reintentar después.
          if (isApiError(error) && error.kind === 'http' && this.session.isAuthenticated()) {
            this.session.end('expired');
          }
          return of(null);
        }),
      ),
    ).finally(() => (this.pendingUser = null));
    return this.pendingUser;
  }
}
