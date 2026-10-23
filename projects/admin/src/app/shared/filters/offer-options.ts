import { computed, inject, Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AdminOffersApi, OfferType } from 'data-access';
import { catchError, map, of, switchMap } from 'rxjs';
import { AdminAccess } from '../../core/access/admin-access';
import { FilterOption } from './filter-select';

/**
 * Ofertas para el filtro "Oferta" de una lista (por nombre, máx. 100). Solo
 * si la persona puede ver ofertas (`offers.read`); si no, queda vacío y el
 * filtro no se muestra. Con `type`, solo las de ese tipo (cambia con él).
 * Debe crearse en un contexto de inyección.
 */
export function offerOptions(type?: () => OfferType | null): Signal<FilterOption<string>[]> {
  const api = inject(AdminOffersApi);
  const access = inject(AdminAccess);
  const source = computed(() =>
    access.can('offers.read') ? { type: type?.() ?? undefined } : null,
  );
  return toSignal(
    toObservable(source).pipe(
      switchMap((query) =>
        query
          ? api.list({ ...query, pageSize: 100, sort: 'NAME_ASC' }).pipe(
              map((page) => page.data.map((o) => ({ value: o.id, label: o.name }))),
              catchError(() => of([])),
            )
          : of([]),
      ),
    ),
    { initialValue: [] },
  );
}
