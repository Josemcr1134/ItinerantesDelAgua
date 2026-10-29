import { inject } from '@angular/core';
import { AdminUserDto, AdminUsersApi } from 'data-access';
import { firstValueFrom } from 'rxjs';
import { rowActions } from '../../shared/list/row-actions';

/**
 * Acciones con confirmación sobre una cuenta (Administradores y Usuarios):
 * deshabilitar o habilitar y marcar el correo como verificado. Al terminar,
 * `done` recibe la cuenta actualizada y el aviso. Contexto de inyección.
 */
export function accountActions(done: (user: AdminUserDto, message: string) => void) {
  const api = inject(AdminUsersApi);
  const rows = rowActions();

  return {
    /** Fila ocupada, errores y confirmaciones (para otras acciones de la página). */
    rows,

    async toggleStatus(user: AdminUserDto): Promise<void> {
      const disabling = user.status !== 'DISABLED';
      const updated = await rows.confirmRun(
        user.id,
        disabling
          ? {
              title: `¿Deshabilitar la cuenta de ${user.fullName}?`,
              message:
                'No podrá iniciar sesión y se cerrarán todas sus sesiones. Puedes volver a habilitarla después.',
              confirmLabel: 'Deshabilitar',
              variant: 'error',
            }
          : {
              title: `¿Habilitar la cuenta de ${user.fullName}?`,
              message: 'Podrá volver a iniciar sesión con sus roles actuales.',
              confirmLabel: 'Habilitar',
              variant: 'info',
            },
        () => firstValueFrom(disabling ? api.disable(user.id) : api.enable(user.id)),
      );
      if (updated) {
        done(
          updated,
          disabling
            ? `Se deshabilitó la cuenta de ${updated.fullName}.`
            : `Se habilitó la cuenta de ${updated.fullName}.`,
        );
      }
    },

    /** Soporte: cuando no le llega el código de verificación. */
    async verifyEmail(user: AdminUserDto): Promise<void> {
      const updated = await rows.confirmRun(
        user.id,
        {
          title: `¿Marcar como verificado el correo de ${user.fullName}?`,
          message: `Úsalo solo si confirmaste que ${user.email} le pertenece y no le llega el código. Podrá iniciar sesión sin verificarlo.`,
          confirmLabel: 'Marcar como verificado',
          variant: 'info',
        },
        () => firstValueFrom(api.verifyEmail(user.id)),
      );
      if (updated) done(updated, `Se marcó como verificado el correo de ${updated.fullName}.`);
    },
  };
}
