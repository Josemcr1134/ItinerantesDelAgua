import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiClient, apiErrorInterceptor, provideApi } from 'data-access';
import { firstValueFrom } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { SESSION_STORAGE, SessionStorage, SessionTokens } from './session/session-storage';
import { SessionStore } from './session/session.store';

const tokens = (access: string, refresh = 'refresh-1'): SessionTokens => ({
  accessToken: access,
  accessTokenExpiresAt: '2026-01-01T00:00:00.000Z',
  refreshToken: refresh,
  refreshTokenExpiresAt: '2026-01-08T00:00:00.000Z',
});

describe('authInterceptor', () => {
  function setup(initial: SessionTokens | null) {
    let stored = initial;
    const storage: SessionStorage = {
      read: () => stored,
      write: (t) => (stored = t),
      clear: () => (stored = null),
    };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor, apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        { provide: SESSION_STORAGE, useValue: storage },
      ],
    });
    return {
      http: TestBed.inject(HttpTestingController),
      client: TestBed.inject(ApiClient),
      session: TestBed.inject(SessionStore),
    };
  }

  const unauthorized = { statusCode: 401, code: 'UNAUTHORIZED', message: 'Sin sesión.' };
  const status401 = { status: 401, statusText: 'Unauthorized' };

  it('adjunta el token a las rutas protegidas', () => {
    const { http, client } = setup(tokens('access-1'));
    client.get('/api/v1/me').subscribe();
    const req = http.expectOne('https://api.test/api/v1/me');
    expect(req.request.headers.get('Authorization')).toBe('Bearer access-1');
    req.flush({});
  });

  it('renueva una sola vez para varias peticiones y las reintenta', async () => {
    const { http, client, session } = setup(tokens('viejo'));
    const a = firstValueFrom(client.get<{ ok: string }>('/api/v1/a'));
    const b = firstValueFrom(client.get<{ ok: string }>('/api/v1/b'));
    http.expectOne('https://api.test/api/v1/a').flush(unauthorized, status401);
    http.expectOne('https://api.test/api/v1/b').flush(unauthorized, status401);

    const refresh = http.expectOne('https://api.test/api/v1/auth/refresh');
    expect(refresh.request.body).toEqual({ refreshToken: 'refresh-1' });
    expect(refresh.request.headers.has('Authorization')).toBe(false);
    refresh.flush({ ...tokens('nuevo', 'refresh-2'), tokenType: 'Bearer', expiresIn: 900 });

    const retryA = http.expectOne('https://api.test/api/v1/a');
    const retryB = http.expectOne('https://api.test/api/v1/b');
    expect(retryA.request.headers.get('Authorization')).toBe('Bearer nuevo');
    retryA.flush({ ok: 'a' });
    retryB.flush({ ok: 'b' });
    expect(await a).toEqual({ ok: 'a' });
    expect(await b).toEqual({ ok: 'b' });
    expect(session.tokens()?.refreshToken).toBe('refresh-2');
  });

  it('cierra la sesión como expirada si la renovación falla', async () => {
    const { http, client, session } = setup(tokens('viejo'));
    const result = firstValueFrom(client.get('/api/v1/me')).catch((e: unknown) => e);
    http.expectOne('https://api.test/api/v1/me').flush(unauthorized, status401);
    http
      .expectOne('https://api.test/api/v1/auth/refresh')
      .flush(
        { statusCode: 401, code: 'AUTH_REFRESH_INVALID', message: 'Sesión vencida.' },
        status401,
      );

    const error = (await result) as { code: string };
    expect(error.code).toBe('UNAUTHORIZED');
    expect(session.isAuthenticated()).toBe(false);
    expect(session.ended()).toBe('expired');
  });
});
