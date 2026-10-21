import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { apiErrorInterceptor, ApiError, provideApi, Role, UserProfileDto } from 'data-access';
import { firstValueFrom } from 'rxjs';
import { STAFF_ROLES } from './auth.config';
import { authGuard, guestGuard } from './auth.guards';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';
import { provideAuth } from './provide-auth';
import { SESSION_STORAGE, SessionStorage, SessionTokens } from './session/session-storage';
import { SessionStore } from './session/session.store';

const API = 'https://api.test/api/v1';
const tokens: SessionTokens = {
  accessToken: 'access-1',
  accessTokenExpiresAt: '2026-01-01T00:00:00.000Z',
  refreshToken: 'refresh-1',
  refreshTokenExpiresAt: '2026-01-08T00:00:00.000Z',
};
const user = (roles: Role[]) => ({ id: 'u1', fullName: 'Ana Pérez', roles }) as UserProfileDto;
const loginResponse = (roles: Role[]) => ({
  ...tokens,
  tokenType: 'Bearer',
  expiresIn: 900,
  user: user(roles),
});

describe('AuthService y guards', () => {
  function setup(initial: SessionTokens | null = null) {
    let stored = initial;
    const storage: SessionStorage = {
      read: () => stored,
      write: (t) => (stored = t),
      clear: () => (stored = null),
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '**', children: [] }]),
        provideHttpClient(withInterceptors([authInterceptor, apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        provideAuth({ allowedRoles: STAFF_ROLES }),
        { provide: SESSION_STORAGE, useValue: storage },
      ],
    });
    return {
      http: TestBed.inject(HttpTestingController),
      auth: TestBed.inject(AuthService),
      session: TestBed.inject(SessionStore),
      stored: () => stored,
    };
  }

  const runGuard = (guard: typeof authGuard, url = '/reportes') =>
    TestBed.runInInjectionContext(() =>
      guard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
    ) as Promise<boolean | UrlTree>;

  it('inicia sesión con una cuenta del equipo', async () => {
    const { http, auth, session, stored } = setup();
    const result = firstValueFrom(auth.login({ email: 'ana@x.com', password: 'Clave123' }));
    http.expectOne(`${API}/auth/login`).flush(loginResponse(['SUPER_ADMIN']));

    expect((await result).fullName).toBe('Ana Pérez');
    expect(session.isAuthenticated()).toBe(true);
    expect(stored()?.refreshToken).toBe('refresh-1');
  });

  it('rechaza a los participantes y revoca la sesión creada', async () => {
    const { http, auth, session } = setup();
    const result = firstValueFrom(auth.login({ email: 'p@x.com', password: 'Clave123' }));
    http.expectOne(`${API}/auth/login`).flush(loginResponse(['PARTICIPANT']));
    const logout = http.expectOne(`${API}/auth/logout`);
    expect(logout.request.body).toEqual({ refreshToken: 'refresh-1' });
    logout.flush(null, { status: 204, statusText: 'No Content' });

    const error = await result.catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe('FORBIDDEN');
    expect(session.isAuthenticated()).toBe(false);
  });

  it('authGuard recupera el usuario con los tokens guardados', async () => {
    const { http } = setup(tokens);
    const result = runGuard(authGuard);
    const me = http.expectOne(`${API}/me`);
    expect(me.request.headers.get('Authorization')).toBe('Bearer access-1');
    me.flush(user(['FINANCE']));
    expect(await result).toBe(true);
  });

  it('authGuard lleva al login con returnUrl si no hay sesión', async () => {
    setup();
    const result = (await runGuard(authGuard)) as UrlTree;
    expect(result.toString()).toBe('/login?returnUrl=%2Freportes');
  });

  it('guestGuard lleva al inicio si ya hay sesión', async () => {
    const { http } = setup(tokens);
    const result = runGuard(guestGuard);
    http.expectOne(`${API}/me`).flush(user(['SUPER_ADMIN']));
    expect(((await result) as UrlTree).toString()).toBe('/');
  });

  it('cerrar sesión borra los tokens y revoca el refresh token', async () => {
    const { http, auth, session, stored } = setup(tokens);
    await auth.logout();
    http.expectOne(`${API}/auth/logout`).flush(null, { status: 204, statusText: 'No Content' });
    expect(session.isAuthenticated()).toBe(false);
    expect(session.ended()).toBe('logout');
    expect(stored()).toBeNull();
  });
});
