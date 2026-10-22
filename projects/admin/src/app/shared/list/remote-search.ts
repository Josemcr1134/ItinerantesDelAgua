import { computed, effect, Signal, signal, untracked, WritableSignal } from '@angular/core';
import { ApiError, Paginated, requestState } from 'data-access';
import { Observable } from 'rxjs';
import { debounced } from '../../core/signals/debounced';

export interface RemoteSearchOptions<T> {
  /** Busca en la API con el texto ya recortado. */
  readonly fetch: (q: string) => Observable<Paginated<T>>;
  /** Caracteres mínimos para buscar (por defecto, 2). */
  readonly minLength?: number;
  readonly debounceMs?: number;
}

export interface RemoteSearch<T> {
  readonly searchText: WritableSignal<string>;
  /** Búsqueda efectiva (tras la espera y recortada). */
  readonly query: Signal<string>;
  /** Hay texto suficiente para buscar. */
  readonly active: Signal<boolean>;
  readonly results: Signal<readonly T[]>;
  readonly loading: Signal<boolean>;
  readonly loaded: Signal<boolean>;
  readonly error: Signal<ApiError | null>;
  readonly minLength: number;
  /** Vacía el texto y los resultados. */
  reset(): void;
}

/**
 * Buscador remoto para selectores (cuentas, docentes…): espera a que se deje
 * de escribir, exige un mínimo de caracteres y cancela la búsqueda anterior.
 * Debe crearse en un contexto de inyección.
 */
export function remoteSearch<T>(options: RemoteSearchOptions<T>): RemoteSearch<T> {
  const minLength = options.minLength ?? 2;
  const searchText = signal('');
  const debouncedText = debounced(searchText, options.debounceMs ?? 300);
  const query = computed(() => debouncedText().trim());
  const active = computed(() => query().length >= minLength);
  const request = requestState<Paginated<T>>();

  effect(() => {
    const q = query();
    untracked(() => {
      if (q.length >= minLength) void request.run(options.fetch(q));
      else request.reset();
    });
  });

  return {
    searchText,
    query,
    active,
    results: computed(() => request.data()?.data ?? []),
    loading: computed(() => request.loading()),
    loaded: computed(() => request.data() !== null),
    error: computed(() => request.error()),
    minLength,
    reset() {
      searchText.set('');
      request.reset();
    },
  };
}
