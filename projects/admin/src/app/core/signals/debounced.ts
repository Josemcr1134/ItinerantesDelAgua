import { Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';

/**
 * Copia de una signal que solo cambia tras `ms` sin cambios (p. ej. una
 * búsqueda mientras se escribe). Debe crearse en un contexto de inyección.
 */
export function debounced<T>(source: Signal<T>, ms = 300): Signal<T> {
  return toSignal(toObservable(source).pipe(debounceTime(ms), distinctUntilChanged()), {
    initialValue: source(),
  });
}
