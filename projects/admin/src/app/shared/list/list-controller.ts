import {
  computed,
  effect,
  linkedSignal,
  Signal,
  signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import { ApiError, Paginated, PaginationMetaDto, requestState } from 'data-access';
import { Observable } from 'rxjs';
import { debounced } from '../../core/signals/debounced';

/** Un filtro sin valor (`''`, `null`) no se envía a la API. */
export type CleanFilters<F> = { [K in keyof F]?: Exclude<F[K], '' | null> };

/** Parámetros que añade el controlador a cada petición. */
export interface ListQuery {
  readonly q?: string;
  readonly page: number;
  readonly pageSize: number;
}

export interface ListControllerOptions<T, F extends object> {
  /** Pide una página a la API con los filtros, la búsqueda y la paginación. */
  readonly fetch: (query: CleanFilters<F> & ListQuery) => Observable<Paginated<T>>;
  /** Filtros de la pantalla (signals). Al cambiar, se vuelve a la página 1. */
  readonly filters?: () => F;
  /** Claves de `filters` que no cuentan como "hay filtros" (orden, alcance…). */
  readonly notFilters?: readonly (keyof F)[];
  readonly pageSize?: number;
  /** Espera de la búsqueda mientras se escribe (ms). */
  readonly debounceMs?: number;
}

/** Estado y acciones de una lista paginada de la API. */
export interface ListController<T> {
  /** Texto de la búsqueda tal como se escribe. */
  readonly searchText: WritableSignal<string>;
  /** Búsqueda efectiva (tras la espera). */
  readonly search: Signal<string>;
  /** Página actual; vuelve a 1 cuando cambian la búsqueda o los filtros. */
  readonly page: WritableSignal<number>;
  readonly items: Signal<readonly T[]>;
  readonly meta: Signal<PaginationMetaDto | null>;
  /** Ya llegó al menos una respuesta. */
  readonly loaded: Signal<boolean>;
  readonly loading: Signal<boolean>;
  readonly error: Signal<ApiError | null>;
  /** Hay búsqueda o algún filtro aplicado. */
  readonly hasFilters: Signal<boolean>;
  /** Cuántos filtros hay aplicados (sin contar la búsqueda ni `notFilters`). */
  readonly activeFilterCount: Signal<number>;
  reload(): void;
  clearSearch(): void;
  /** Reemplaza un elemento sin volver a pedir la lista (p. ej. tras editarlo). */
  replace(match: (item: T) => boolean, item: T): void;
}

const isBlank = (value: unknown) => value === '' || value === null || value === undefined;

/**
 * Lista paginada con búsqueda (con espera), filtros y paginación: arma la
 * consulta, vuelve a la página 1 al filtrar (sin pedir dos veces) y cancela la
 * petición anterior. Debe crearse en un contexto de inyección.
 *
 * ```ts
 * protected readonly role = signal<Role | ''>('');
 * protected readonly list = listController({
 *   fetch: (query) => this.api.list(query),
 *   filters: () => ({ role: this.role(), sort: this.sort() }),
 *   notFilters: ['sort'],
 * });
 * ```
 */
export function listController<T, F extends object = Record<never, never>>(
  options: ListControllerOptions<T, F>,
): ListController<T> {
  const pageSize = options.pageSize ?? 20;
  const notFilters = new Set<PropertyKey>(options.notFilters ?? []);
  const searchText = signal('');
  const search = debounced(searchText, options.debounceMs ?? 300);

  const filters = computed(() => {
    const raw = options.filters?.() ?? ({} as F);
    return Object.fromEntries(
      Object.entries(raw).filter(([, value]) => !isBlank(value)),
    ) as CleanFilters<F>;
  });
  const filtersKey = computed(() => JSON.stringify([search().trim(), filters()]));
  const page = linkedSignal({ source: filtersKey, computation: () => 1 });

  const query = computed(() => ({
    ...filters(),
    q: search().trim() || undefined,
    page: page(),
    pageSize,
  }));

  const activeFilterCount = computed(
    () => Object.keys(filters()).filter((key) => !notFilters.has(key)).length,
  );

  const request = requestState<Paginated<T>>();
  effect(() => {
    const current = query();
    untracked(() => void request.run(options.fetch(current)));
  });

  return {
    searchText,
    search,
    page,
    items: computed(() => request.data()?.data ?? []),
    meta: computed(() => request.data()?.meta ?? null),
    loaded: computed(() => request.data() !== null),
    loading: computed(() => request.loading()),
    error: computed(() => request.error()),
    hasFilters: computed(() => !!search().trim() || activeFilterCount() > 0),
    activeFilterCount,
    reload: () => void request.run(options.fetch(query())),
    clearSearch: () => searchText.set(''),
    replace(match, item) {
      const current = request.data();
      if (current) {
        request.set({ ...current, data: current.data.map((x) => (match(x) ? item : x)) });
      }
    },
  };
}
