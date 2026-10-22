import { inject, signal } from '@angular/core';
import { AlertOptions, AlertService } from 'ui-kit';
import { ErrorPresenter } from '../../core/error-presenter';

/** Pregunta de confirmación de una acción. */
export interface RowConfirm {
  readonly title: string;
  readonly message: string;
  readonly confirmLabel: string;
  readonly variant?: AlertOptions['variant'];
}

/**
 * Acciones sobre una fila de una lista: marca la fila como ocupada mientras
 * corre la acción (para deshabilitar sus botones) y presenta el error si
 * falla. Debe crearse en un contexto de inyección.
 */
export function rowActions() {
  const errors = inject(ErrorPresenter);
  const alerts = inject(AlertService);
  const busyId = signal<string | null>(null);

  async function run<T>(id: string, task: () => Promise<T>): Promise<T | null> {
    busyId.set(id);
    try {
      return await task();
    } catch (error) {
      void errors.present(error);
      return null;
    } finally {
      busyId.set(null);
    }
  }

  return {
    /** Fila ocupada (o `null`). */
    busyId: busyId.asReadonly(),
    isBusy: (id: string) => busyId() === id,
    /** Ejecuta la acción; devuelve su resultado o `null` si falló. */
    run,
    /** Pide confirmación y, si se acepta, ejecuta la acción (`null` si se canceló o falló). */
    async confirmRun<T>(
      id: string,
      confirm: RowConfirm,
      task: () => Promise<T>,
    ): Promise<T | null> {
      const accepted = await alerts.confirm(confirm.title, confirm.message, {
        confirmLabel: confirm.confirmLabel,
        variant: confirm.variant ?? 'warning',
      });
      return accepted ? run(id, task) : null;
    },
  };
}
