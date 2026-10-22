import { inject, signal } from '@angular/core';
import { ErrorPresenter } from '../../core/error-presenter';

/**
 * Acciones sobre una fila de una lista: marca la fila como ocupada mientras
 * corre la acción (para deshabilitar sus botones) y presenta el error si
 * falla. Debe crearse en un contexto de inyección.
 */
export function rowActions() {
  const errors = inject(ErrorPresenter);
  const busyId = signal<string | null>(null);
  return {
    /** Fila ocupada (o `null`). */
    busyId: busyId.asReadonly(),
    isBusy: (id: string) => busyId() === id,
    /** Ejecuta la acción; devuelve su resultado o `null` si falló. */
    async run<T>(id: string, task: () => Promise<T>): Promise<T | null> {
      busyId.set(id);
      try {
        return await task();
      } catch (error) {
        void errors.present(error);
        return null;
      } finally {
        busyId.set(null);
      }
    },
  };
}
