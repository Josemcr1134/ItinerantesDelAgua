import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from 'data-access';
import { AUTH_CONFIG } from './auth.config';
import { AuthService } from './auth.service';
import { SessionStore } from './session/session.store';

/** Solo con sesión y acceso a la app; si no, al login con `returnUrl`. */
export const authGuard: CanActivateFn = async (_route, state) => {
  const router = inject(Router);
  const config = inject(AUTH_CONFIG);
  const user = await inject(AuthService).ensureUser();
  return user
    ? true
    : router.createUrlTree([config.loginUrl], { queryParams: { returnUrl: state.url } });
};

/** Solo sin sesión (login, recuperar contraseña); si no, al inicio. */
export const guestGuard: CanActivateFn = async () => {
  // `inject()` solo funciona antes del primer `await`.
  const router = inject(Router);
  const config = inject(AUTH_CONFIG);
  const user = await inject(AuthService).ensureUser();
  return user ? router.parseUrl(config.homeUrl) : true;
};

/** Restringe una ruta a ciertos roles (usar después de `authGuard`). */
export function roleGuard(roles: readonly Role[]): CanActivateFn {
  return () =>
    inject(SessionStore).hasAnyRole(roles) || inject(Router).parseUrl(inject(AUTH_CONFIG).homeUrl);
}
