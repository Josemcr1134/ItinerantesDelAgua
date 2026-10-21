import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { ApiClient, toHttpParams } from './api-client';
import { provideApi } from './api-config';
import { ApiError, toApiError } from './api-error';
import { apiErrorInterceptor } from './api-error.interceptor';
import { silentRequest } from './http-context';
import { loadingInterceptor } from './loading.interceptor';
import { LoadingService } from './loading.service';
import { requestState } from './request-state';
import { OFFER_TYPE_VALUES, ROLE_VALUES, SESSION_SCOPE_VALUES } from './models.generated';
import { OffersApi } from './services/offers.api';

describe('tipado generado', () => {
  it('expone los valores de cada enum para filtros y selects', () => {
    expect(OFFER_TYPE_VALUES).toEqual(['DIPLOMA', 'COURSE', 'WORKSHOP', 'EVENT', 'OPEN_CALL']);
    expect(SESSION_SCOPE_VALUES).toEqual(['UPCOMING', 'PAST']);
    expect(ROLE_VALUES).toContain('SUPER_ADMIN');
  });
});

describe('toApiError', () => {
  it('usa el formato de error de la API', () => {
    const error = toApiError(
      new HttpErrorResponse({
        status: 400,
        error: {
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          message: 'Los datos enviados no son válidos.',
          details: [{ field: 'email', code: 'IS_EMAIL', message: 'Debe ser un correo válido.' }],
          requestId: 'req-1',
        },
      }),
    );
    expect(error).toBeInstanceOf(ApiError);
    expect(error.kind).toBe('http');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.requestId).toBe('req-1');
    expect(error.fieldErrors()).toEqual({ email: 'Debe ser un correo válido.' });
  });

  it('conserva los datos extra de `meta`', () => {
    const error = toApiError(
      new HttpErrorResponse({
        status: 429,
        error: {
          statusCode: 429,
          code: 'AUTH_LOGIN_LOCKED',
          message: 'Cuenta bloqueada temporalmente.',
          meta: { lockedUntil: '2026-01-01T10:15:00Z', attemptsRemaining: 0 },
          requestId: 'req-2',
        },
      }),
    );
    expect(error.metaString('lockedUntil')).toBe('2026-01-01T10:15:00Z');
    expect(error.metaNumber('attemptsRemaining')).toBe(0);
    expect(error.metaNumber('lockedUntil')).toBeNull();
  });

  it('reconoce la falta de conexión', () => {
    const error = toApiError(new HttpErrorResponse({ status: 0 }));
    expect(error.kind).toBe('network');
    expect(error.code).toBe('NETWORK_ERROR');
  });

  it('cubre respuestas sin cuerpo de error y toma el requestId de la cabecera', () => {
    const error = toApiError(
      new HttpErrorResponse({ status: 502, headers: new HttpHeaders({ 'X-Request-Id': 'abc' }) }),
    );
    expect(error.code).toBe('INTERNAL_ERROR');
    expect(error.requestId).toBe('abc');
  });

  it('cubre errores inesperados', () => {
    expect(toApiError(new Error('boom')).kind).toBe('unknown');
  });
});

describe('toHttpParams', () => {
  it('omite vacíos y repite claves para arrays', () => {
    const params = toHttpParams({
      page: 1,
      q: '',
      tz: undefined,
      type: ['DIPLOMA', 'COURSE'],
      free: false,
    });
    expect(params.toString()).toBe('page=1&type=DIPLOMA&type=COURSE&free=false');
  });
});

describe('interceptores de la API', () => {
  function setup() {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loadingInterceptor, apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test/' }),
      ],
    });
    return {
      http: TestBed.inject(HttpTestingController),
      loading: TestBed.inject(LoadingService),
      client: TestBed.inject(ApiClient),
    };
  }

  it('cuenta las peticiones en curso para el loader general', async () => {
    const { http, loading, client } = setup();
    const a = firstValueFrom(client.get('/a'));
    const b = firstValueFrom(client.get('/b'));
    expect(loading.isLoading()).toBe(true);
    http.expectOne('https://api.test/a').flush({});
    expect(loading.isLoading()).toBe(true);
    http.expectOne('https://api.test/b').flush({});
    await Promise.all([a, b]);
    expect(loading.isLoading()).toBe(false);
  });

  it('no activa el loader general en peticiones silenciosas', () => {
    const { http, loading, client } = setup();
    client.get('/c', { context: silentRequest() }).subscribe();
    expect(loading.isLoading()).toBe(false);
    http.expectOne('https://api.test/c').flush({});
  });

  it('entrega los errores normalizados y apaga el loader', async () => {
    const { http, loading, client } = setup();
    const result = firstValueFrom(client.get('/d')).catch((e: unknown) => e);
    http
      .expectOne('https://api.test/d')
      .flush(
        { statusCode: 404, code: 'NOT_FOUND', message: 'No existe.' },
        { status: 404, statusText: 'Not Found' },
      );
    const error = (await result) as ApiError;
    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe('NOT_FOUND');
    expect(loading.isLoading()).toBe(false);
  });

  it('los servicios construyen la URL y la query', () => {
    const { http } = setup();
    TestBed.inject(OffersApi)
      .list({ page: 2, type: ['COURSE'] })
      .subscribe();
    const req = http.expectOne((r) => r.url === 'https://api.test/api/v1/offers');
    expect(req.request.params.toString()).toBe('page=2&type=COURSE');
    req.flush({ data: [], meta: { page: 2, pageSize: 20, total: 0, totalPages: 0 } });
  });
});

describe('requestState', () => {
  @Component({ template: '' })
  class Host {
    readonly state = requestState<number>();
  }

  it('refleja carga, datos y error', async () => {
    const { state } = TestBed.createComponent(Host).componentInstance;
    expect(state.loading()).toBe(false);

    const ok = state.run(of(42));
    expect(await ok).toBe(42);
    expect(state.data()).toBe(42);
    expect(state.success()).toBe(true);

    const failed = await state.run(throwError(() => new HttpErrorResponse({ status: 0 })));
    expect(failed).toBeNull();
    expect(state.error()?.kind).toBe('network');
    expect(state.loading()).toBe(false);
  });
});
