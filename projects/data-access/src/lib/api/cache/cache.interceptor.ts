import { HttpContext, HttpHeaders, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, concat, EMPTY, filter, of } from 'rxjs';
import { SKIP_GLOBAL_LOADER } from '../http-context';
import { ApiCache, CacheEntry } from './api-cache';
import { CACHE_REQUEST } from './cache-options';

/** Copia del contexto sin loader general (sin modificar el original, que el servicio puede reutilizar). */
function silentCopy(context: HttpContext): HttpContext {
  const copy = new HttpContext();
  for (const token of context.keys()) {
    copy.set(token, context.get(token));
  }
  return copy.set(SKIP_GLOBAL_LOADER, true);
}

const fromCache = (entry: CacheEntry, state: 'HIT' | 'STALE') =>
  new HttpResponse({
    body: entry.body,
    status: entry.status,
    url: entry.url ?? undefined,
    headers: new HttpHeaders({ 'X-Cache': state }),
  });

/**
 * Caché de las peticiones GET marcadas con `cachedRequest(...)`
 * (stale-while-revalidate):
 *
 * - **Fresca**: responde desde el caché, sin llamar a la API.
 * - **Vencida pero mostrable**: responde al instante con la copia y la renueva
 *   en segundo plano (sin loader general); si llega una versión nueva, se
 *   emite también. Si la API falla, se queda la copia.
 * - **Sin copia**: llama a la API y guarda la respuesta.
 *
 * Las peticiones simultáneas a la misma URL comparten una sola llamada.
 * Debe ir primero en `withInterceptors`, para que una respuesta del caché no
 * active el loader general.
 */
export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const options = req.context.get(CACHE_REQUEST);
  if (!options || req.method !== 'GET') {
    return next(req);
  }
  const cache = inject(ApiCache);
  const key = req.urlWithParams;
  const entry = cache.read(key);

  if (entry && Date.now() < entry.freshUntil) {
    return of(fromCache(entry, 'HIT'));
  }
  if (entry) {
    const background = req.clone({ context: silentCopy(req.context) });
    return concat(
      of(fromCache(entry, 'STALE')),
      cache.fetch(key, next(background), options).pipe(
        filter((event) => event instanceof HttpResponse),
        catchError(() => EMPTY),
      ),
    );
  }
  return cache.fetch(key, next(req), options);
};
