import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiClient, apiErrorInterceptor, provideApi } from 'data-access';
import { firstValueFrom } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { SESSION_STORAGE, SessionStorage, SessionTokens } from './session/session-storage';
import { SessionStore } from './session/session.store';

const API = 'https://api.test/api/v1';
/** Deja correr las promesas de la renovación (candado entre pestañas). */
const tick = () => new Promise((resolve) => setTimeout(resolve));
const inMinutes = (minutes: number) => new Date(Date.now() + minutes * 60_000).toISOString();

const tokens = (access: string, refresh = 'refresh-1', accessMinutes = 15): SessionTokens => ({
  accessToken: access,
  accessTokenExpiresAt: inMinutes(accessMinutes),
  refreshToken: refresh,
  refreshTokenExpiresAt: inMinutes(60 * 24 * 7),
});

const refreshResponse = (access: string, refresh: string) => ({
  ...tokens(access, refresh),
  tokenType: 'Bearer',
  expiresIn: 900,
});

describe('authInterceptor', () => {
  function setup(initial: SessionTokens | null) {
    let stored = initial;
    let otherTab: ((t: SessionTokens | null) => void) | null = null;
    const storage: SessionStorage = {
      read: () => stored,
      write: (t) => (stored = t),
      clear: () => (stored = null),
      watch: (listener) => {
        otherTab = listener;
        return () => (otherTab = null);
      },
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
      /** Simula que otra pestaña escribe (o borra) los tokens. */
      fromOtherTab(t: SessionTokens | null) {
        stored = t;
        otherTab?.(t);
      },
      /** Simula una escritura de otra pestaña sin evento (aún no llegó). */
      writeSilently(t: SessionTokens) {
        stored = t;
      },
    };
  }

  const unauthorized = { statusCode: 401, code: 'UNAUTHORIZED', message: 'Sin sesión.' };
  const status401 = { status: 401, statusText: 'Unauthorized' };

  it('adjunta el token a las rutas protegidas', () => {
    const { http, client } = setup(tokens('access-1'));
    client.get('/api/v1/me').subscribe();
    const req = http.expectOne(`${API}/me`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer access-1');
    req.flush({});
  });

  it('no envía el token a otros dominios', () => {
    const { http } = setup(tokens('access-1'));
    TestBed.inject(HttpClient).get('https://storage.example.com/archivo.pdf').subscribe();
    const req = http.expectOne('https://storage.example.com/archivo.pdf');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('renueva una sola vez para varias peticiones y las reintenta', async () => {
    const { http, client, session } = setup(tokens('viejo'));
    const a = firstValueFrom(client.get<{ ok: string }>('/api/v1/a'));
    const b = firstValueFrom(client.get<{ ok: string }>('/api/v1/b'));
    http.expectOne(`${API}/a`).flush(unauthorized, status401);
    http.expectOne(`${API}/b`).flush(unauthorized, status401);
    await tick();

    const refresh = http.expectOne(`${API}/auth/refresh`);
    expect(refresh.request.body).toEqual({ refreshToken: 'refresh-1' });
    expect(refresh.request.headers.has('Authorization')).toBe(false);
    refresh.flush(refreshResponse('nuevo', 'refresh-2'));
    await tick();

    const retryA = http.expectOne(`${API}/a`);
    const retryB = http.expectOne(`${API}/b`);
    expect(retryA.request.headers.get('Authorization')).toBe('Bearer nuevo');
    retryA.flush({ ok: 'a' });
    retryB.flush({ ok: 'b' });
    expect(await a).toEqual({ ok: 'a' });
    expect(await b).toEqual({ ok: 'b' });
    expect(session.tokens()?.refreshToken).toBe('refresh-2');
  });

  it('renueva antes de enviar si el access token está por vencer', async () => {
    const { http, client } = setup(tokens('casi-vencido', 'refresh-1', 0.25));
    const result = firstValueFrom(client.get<{ ok: boolean }>('/api/v1/me'));
    await tick();

    http.expectOne(`${API}/auth/refresh`).flush(refreshResponse('nuevo', 'refresh-2'));
    await tick();
    const req = http.expectOne(`${API}/me`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer nuevo');
    req.flush({ ok: true });
    expect(await result).toEqual({ ok: true });
  });

  it('usa los tokens que otra pestaña ya renovó en lugar de renovar de nuevo', async () => {
    const { http, client, writeSilently } = setup(tokens('viejo'));
    const result = firstValueFrom(client.get<{ ok: boolean }>('/api/v1/me'));
    // La otra pestaña rotó los tokens mientras esta petición estaba en curso.
    writeSilently(tokens('de-otra-pestana', 'refresh-2'));
    http.expectOne(`${API}/me`).flush(unauthorized, status401);
    await tick();

    http.expectNone(`${API}/auth/refresh`);
    const retry = http.expectOne(`${API}/me`);
    expect(retry.request.headers.get('Authorization')).toBe('Bearer de-otra-pestana');
    retry.flush({ ok: true });
    expect(await result).toEqual({ ok: true });
  });

  it('sincroniza los tokens y el cierre de sesión entre pestañas', () => {
    const { session, fromOtherTab } = setup(tokens('a'));
    fromOtherTab(tokens('b', 'refresh-2'));
    expect(session.tokens()?.accessToken).toBe('b');

    fromOtherTab(null);
    expect(session.isAuthenticated()).toBe(false);
    expect(session.ended()).toBe('logout');
  });

  it('cierra la sesión como expirada si la API rechaza el refresh token', async () => {
    const { http, client, session } = setup(tokens('viejo'));
    const result = firstValueFrom(client.get('/api/v1/me')).catch((e: unknown) => e);
    http.expectOne(`${API}/me`).flush(unauthorized, status401);
    await tick();
    http
      .expectOne(`${API}/auth/refresh`)
      .flush(
        { statusCode: 401, code: 'AUTH_REFRESH_INVALID', message: 'Sesión vencida.' },
        status401,
      );

    const error = (await result) as { code: string };
    expect(error.code).toBe('UNAUTHORIZED');
    expect(session.isAuthenticated()).toBe(false);
    expect(session.ended()).toBe('expired');
  });

  it('conserva la sesión si la renovación falla por la red', async () => {
    const { http, client, session } = setup(tokens('viejo'));
    const result = firstValueFrom(client.get('/api/v1/me')).catch((e: unknown) => e);
    http.expectOne(`${API}/me`).flush(unauthorized, status401);
    await tick();
    http.expectOne(`${API}/auth/refresh`).error(new ProgressEvent('error'));

    const error = (await result) as { code: string };
    expect(error.code).toBe('NETWORK_ERROR');
    expect(session.isAuthenticated()).toBe(true);
    expect(session.ended()).toBeNull();
  });

  it('no reintenta más de una vez si el token nuevo también es rechazado', async () => {
    const { http, client } = setup(tokens('viejo'));
    const result = firstValueFrom(client.get('/api/v1/me')).catch((e: unknown) => e);
    http.expectOne(`${API}/me`).flush(unauthorized, status401);
    await tick();
    http.expectOne(`${API}/auth/refresh`).flush(refreshResponse('nuevo', 'refresh-2'));
    await tick();
    http.expectOne(`${API}/me`).flush(unauthorized, status401);

    expect(((await result) as { statusCode: number }).statusCode).toBe(401);
    http.verify();
  });
});
