import { computed, DestroyRef, inject, signal } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ApiError, toApiError } from './api-error';

export interface RequestState<T> {
  /** Último resultado correcto (o `null`). */
  readonly data: () => T | null;
  /** Último error, normalizado (o `null`). */
  readonly error: () => ApiError | null;
  /** Hay una petición en curso. */
  readonly loading: () => boolean;
  /** Hay datos y no hay error ni carga en curso. */
  readonly success: () => boolean;
  /**
   * Lanza la petición (cancela la anterior si sigue en curso). Devuelve una
   * promesa con el resultado o `null` si falló, para encadenar acciones.
   */
  run(request: Observable<T>): Promise<T | null>;
  /** Vuelve al estado inicial. */
  reset(): void;
}

/**
 * Estado local de una petición con signals (cargando / error / datos) para
 * loaders y mensajes dentro de una pantalla. Debe crearse en un contexto de
 * inyección (p. ej. como campo de un componente): se cancela al destruirlo.
 *
 * ```ts
 * protected readonly offers = requestState<Paginated<OfferSummaryDto>>();
 * ngOnInit() { this.offers.run(this.offersApi.list({ page: 1 })); }
 * ```
 */
export function requestState<T>(): RequestState<T> {
  const data = signal<T | null>(null);
  const error = signal<ApiError | null>(null);
  const loading = signal(false);
  let subscription: Subscription | null = null;
  inject(DestroyRef).onDestroy(() => subscription?.unsubscribe());

  return {
    data: data.asReadonly(),
    error: error.asReadonly(),
    loading: loading.asReadonly(),
    success: computed(() => data() !== null && !error() && !loading()),
    run(request) {
      subscription?.unsubscribe();
      loading.set(true);
      error.set(null);
      return new Promise<T | null>((resolve) => {
        subscription = request.subscribe({
          next: (value) => data.set(value),
          error: (err: unknown) => {
            error.set(toApiError(err));
            loading.set(false);
            resolve(null);
          },
          complete: () => {
            loading.set(false);
            resolve(data());
          },
        });
      });
    },
    reset() {
      subscription?.unsubscribe();
      data.set(null);
      error.set(null);
      loading.set(false);
    },
  };
}
