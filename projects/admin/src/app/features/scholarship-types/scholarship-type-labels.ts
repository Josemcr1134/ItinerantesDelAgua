import { computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AdminScholarshipTypeDto, AdminScholarshipTypesApi } from 'data-access';
import { catchError, map, of } from 'rxjs';
import { FilterOption } from '../../shared/filters/filter-select';

/** "15%" (fijo) o "71–80%" (rango). */
export function percentRange(min: number, max: number): string {
  return min === max ? `${min}%` : `${min}–${max}%`;
}

/** "Aguas Libres (50%)" de un tipo con su % (o su rango si aún no hay %). */
export function scholarshipLabel(
  type: { name: string; minPercent: number; maxPercent: number } | null | undefined,
  percent?: number | null,
): string | null {
  if (!type) return null;
  return `${type.name} (${percent ?? percentRange(type.minPercent, type.maxPercent)}${
    percent !== null && percent !== undefined ? '%' : ''
  })`;
}

/**
 * Catálogo de tipos de beca del panel (incluye inactivos). Lo pueden ver
 * todas las personas con `offers.read`; si falla, queda vacío. Debe crearse
 * en un contexto de inyección.
 */
export function scholarshipTypeCatalog(): Signal<readonly AdminScholarshipTypeDto[]> {
  return toSignal(
    inject(AdminScholarshipTypesApi)
      .list()
      .pipe(
        map((r) => r.data),
        catchError(() => of([])),
      ),
    { initialValue: [] },
  );
}

/** Opciones para filtrar por tipo de beca (los inactivos, marcados). */
export function scholarshipTypeOptions(): Signal<FilterOption<string>[]> {
  const catalog = scholarshipTypeCatalog();
  return computed(() =>
    catalog().map((t) => ({ value: t.id, label: t.active ? t.name : `${t.name} (desactivado)` })),
  );
}
