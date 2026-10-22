import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, toArray } from 'rxjs';
import { apiErrorInterceptor } from '../api-error.interceptor';
import { SKIP_GLOBAL_LOADER } from '../http-context';
import { loadingInterceptor } from '../loading.interceptor';
import { LoadingService } from '../loading.service';
import { ApiCache } from './api-cache';
import { cachedRequest, minutes } from './cache-options';
import { cacheInterceptor } from './cache.interceptor';

const URL = 'https://api.test/api/v1/site/metrics';
const STORAGE_KEY = `itinerantes.cache.v1:${URL}`;

describe('cacheInterceptor', () => {
  let now: number;

  beforeEach(() => {
    localStorage.clear();
    now = Date.parse('2026-10-22T12:00:00Z');
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withInterceptors([cacheInterceptor, loadingInterceptor, apiErrorInterceptor]),
        ),
        provideHttpClientTesting(),
      ],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    TestBed.inject(HttpTestingController).verify();
  });

  const http = () => TestBed.inject(HttpClient);
  const backend = () => TestBed.inject(HttpTestingController);
  const cached = (context?: HttpContext) =>
    http().get<{ v: number }>(URL, { context: cachedRequest({ ttl: minutes(60) }, context) });
  const all = (source: ReturnType<typeof cached>) => firstValueFrom(source.pipe(toArray()));

  it('reutiliza la respuesta fresca sin volver a llamar a la API', async () => {
    const first = all(cached());
    backend().expectOne(URL).flush({ v: 1 });
    expect(await first).toEqual([{ v: 1 }]);

    now += minutes(59);
    expect(await all(cached())).toEqual([{ v: 1 }]);
    backend().expectNone(URL);
  });

  it('une las peticiones simultáneas en una sola llamada', async () => {
    const a = all(cached());
    const b = all(cached());
    backend().expectOne(URL).flush({ v: 1 });
    expect(await a).toEqual([{ v: 1 }]);
    expect(await b).toEqual([{ v: 1 }]);
  });

  it('vencida: responde con la copia y la renueva en segundo plano, sin loader', async () => {
    const first = all(cached());
    backend().expectOne(URL).flush({ v: 1 });
    await first;

    now += minutes(61);
    const result = all(cached());
    const revalidation = backend().expectOne(URL);
    expect(revalidation.request.context.get(SKIP_GLOBAL_LOADER)).toBe(true);
    expect(TestBed.inject(LoadingService).isLoading()).toBe(false);
    revalidation.flush({ v: 2 });
    expect(await result).toEqual([{ v: 1 }, { v: 2 }]);

    // Y la nueva queda fresca.
    expect(await all(cached())).toEqual([{ v: 2 }]);
  });

  it('si la renovación falla, se queda con la copia sin error', async () => {
    const first = all(cached());
    backend().expectOne(URL).flush({ v: 1 });
    await first;

    now += minutes(61);
    const result = all(cached());
    backend().expectOne(URL).flush({}, { status: 503, statusText: 'Service Unavailable' });
    expect(await result).toEqual([{ v: 1 }]);
  });

  it('sobrevive a una recarga gracias a localStorage', async () => {
    const first = all(cached());
    backend().expectOne(URL).flush({ v: 1 });
    await first;
    expect(localStorage.getItem(STORAGE_KEY)).toContain('"v":1');

    // Simula una visita nueva: memoria vacía, mismo localStorage.
    TestBed.inject(ApiCache)['memory'].clear();
    expect(await all(cached())).toEqual([{ v: 1 }]);
  });

  it('descarta la copia demasiado antigua y propaga el error si la API falla', async () => {
    const first = all(cached());
    backend().expectOne(URL).flush({ v: 1 });
    await first;

    now += minutes(60) + 8 * 86_400_000;
    const result = firstValueFrom(cached()).catch((e: unknown) => e);
    backend().expectOne(URL).flush({}, { status: 503, statusText: 'Service Unavailable' });
    expect(((await result) as { statusCode: number }).statusCode).toBe(503);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('no cachea las peticiones sin cachedRequest ni los errores', async () => {
    const plain = firstValueFrom(http().get(URL));
    backend().expectOne(URL).flush({ v: 1 });
    await plain;
    const failed = firstValueFrom(cached()).catch(() => null);
    backend().expectOne(URL).flush({}, { status: 500, statusText: 'Error' });
    await failed;
    expect(localStorage.length).toBe(0);
  });

  it('invalidate borra memoria y localStorage', async () => {
    const first = all(cached());
    backend().expectOne(URL).flush({ v: 1 });
    await first;

    TestBed.inject(ApiCache).invalidate('https://api.test/api/v1/site');
    expect(localStorage.length).toBe(0);
    const again = all(cached());
    backend().expectOne(URL).flush({ v: 3 });
    expect(await again).toEqual([{ v: 3 }]);
  });
});
