import { HttpContext, HttpContextToken } from '@angular/common/http';

/** Cómo se guarda en caché la respuesta de una petición GET. */
export interface CacheOptions {
  /** Tiempo (ms) durante el que la respuesta se usa sin volver a pedirla. */
  readonly ttl: number;
  /**
   * Tiempo extra (ms) en que la copia vencida todavía se muestra al instante
   * mientras se renueva en segundo plano; si la API falla, se conserva.
   * Por defecto, 7 días.
   */
  readonly staleTtl?: number;
  /** Guardar también en `localStorage` (sobrevive a recargas). Por defecto, sí. */
  readonly persist?: boolean;
}

/** Duraciones legibles para `CacheOptions`. */
export const minutes = (n: number) => n * 60_000;
export const hours = (n: number) => n * 3_600_000;
export const days = (n: number) => n * 86_400_000;

export const DEFAULT_STALE_TTL = days(7);

/** Opciones de caché de la petición (`null`: sin caché). */
export const CACHE_REQUEST = new HttpContextToken<CacheOptions | null>(() => null);

/**
 * Contexto para cachear una petición GET. Solo para datos públicos que no
 * dependen de la persona (catálogos, cifras): la clave es la URL.
 *
 * ```ts
 * this.api.get<T>('/api/v1/site/metrics', { context: cachedRequest({ ttl: hours(1) }) });
 * ```
 */
export const cachedRequest = (options: CacheOptions, context = new HttpContext()) =>
  context.set(CACHE_REQUEST, options);
