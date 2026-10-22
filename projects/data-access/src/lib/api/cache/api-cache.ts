import { isPlatformBrowser } from '@angular/common';
import { HttpEvent, HttpResponse } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { finalize, Observable, share, tap } from 'rxjs';
import { CacheOptions, DEFAULT_STALE_TTL } from './cache-options';

/** Respuesta guardada. Las fechas son marcas de tiempo (ms). */
export interface CacheEntry {
  readonly body: unknown;
  readonly status: number;
  readonly url: string | null;
  /** Hasta cuándo se usa sin volver a pedirla. */
  readonly freshUntil: number;
  /** Hasta cuándo se puede mostrar mientras se renueva. */
  readonly staleUntil: number;
}

/** Cambiar la versión descarta todo lo guardado (p. ej. si cambia un DTO). */
const STORAGE_PREFIX = 'itinerantes.cache.v1:';

const isEntry = (value: unknown): value is CacheEntry =>
  typeof value === 'object' &&
  value !== null &&
  'body' in value &&
  typeof (value as CacheEntry).freshUntil === 'number' &&
  typeof (value as CacheEntry).staleUntil === 'number';

/**
 * Almacén del caché HTTP: memoria (para la sesión) y `localStorage` (entre
 * visitas). Además une las peticiones simultáneas a la misma URL en una sola.
 * En el servidor (prerender) solo usa memoria.
 */
@Injectable({ providedIn: 'root' })
export class ApiCache {
  private readonly memory = new Map<string, CacheEntry>();
  private readonly inFlight = new Map<string, Observable<HttpEvent<unknown>>>();
  private readonly storage = isPlatformBrowser(inject(PLATFORM_ID)) ? safeStorage() : null;

  /** Entrada vigente (fresca o aún mostrable) o `null`. */
  read(key: string, now = Date.now()): CacheEntry | null {
    const entry = this.memory.get(key) ?? this.readStorage(key);
    if (!entry || now >= entry.staleUntil) {
      this.delete(key);
      return null;
    }
    this.memory.set(key, entry);
    return entry;
  }

  /**
   * Pide la respuesta (una sola vez aunque la pidan varios a la vez) y la
   * guarda si es correcta.
   */
  fetch(
    key: string,
    request: Observable<HttpEvent<unknown>>,
    options: CacheOptions,
  ): Observable<HttpEvent<unknown>> {
    let shared = this.inFlight.get(key);
    if (!shared) {
      shared = request.pipe(
        tap((event) => {
          if (event instanceof HttpResponse && event.ok) {
            this.write(key, event, options);
          }
        }),
        finalize(() => this.inFlight.delete(key)),
        share(),
      );
      this.inFlight.set(key, shared);
    }
    return shared;
  }

  /** Borra las entradas cuya clave empieza por `prefix` (todas si se omite). */
  invalidate(prefix = ''): void {
    for (const key of [...this.memory.keys()]) {
      if (key.startsWith(prefix)) this.memory.delete(key);
    }
    if (!this.storage) return;
    const full = STORAGE_PREFIX + prefix;
    for (let i = this.storage.length - 1; i >= 0; i--) {
      const key = this.storage.key(i);
      if (key?.startsWith(full)) this.storage.removeItem(key);
    }
  }

  private write(key: string, response: HttpResponse<unknown>, options: CacheOptions): void {
    const now = Date.now();
    const entry: CacheEntry = {
      body: response.body,
      status: response.status,
      url: response.url,
      freshUntil: now + options.ttl,
      staleUntil: now + options.ttl + (options.staleTtl ?? DEFAULT_STALE_TTL),
    };
    this.memory.set(key, entry);
    if (options.persist !== false) {
      try {
        this.storage?.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
      } catch {
        // Sin espacio o almacenamiento bloqueado: queda solo en memoria.
      }
    }
  }

  private readStorage(key: string): CacheEntry | null {
    try {
      const raw = this.storage?.getItem(STORAGE_PREFIX + key);
      const parsed: unknown = raw ? JSON.parse(raw) : null;
      return isEntry(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  private delete(key: string): void {
    this.memory.delete(key);
    try {
      this.storage?.removeItem(STORAGE_PREFIX + key);
    } catch {
      // Nada que borrar.
    }
  }
}

/** `localStorage` si está disponible (navegación privada puede bloquearlo). */
function safeStorage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}
