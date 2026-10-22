import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'auth';
import { Permission } from 'data-access';
import { AlertService } from 'ui-kit';
import { AdminAccess } from './admin-access';

/**
 * Carga el acceso al panel (`GET /admin/me`) antes de mostrarlo. Si la cuenta
 * no es del equipo (403), avisa y cierra la sesión; si falla la conexión,
 * avisa y permite reintentar recargando.
 */
export const adminAccessGuard: CanActivateFn = async () => {
  // `inject()` solo funciona antes del primer `await`.
  const access = inject(AdminAccess);
  const alerts = inject(AlertService);
  const auth = inject(AuthService);
  const result = await access.load();
  if (result === 'granted') {
    return true;
  }
  if (result === 'forbidden') {
    await alerts.error(
      'Acceso restringido',
      'Tu cuenta no tiene un rol del equipo. Si crees que es un error, contacta a un superadministrador.',
    );
    await auth.logout();
    return false;
  }
  await alerts.open({
    variant: 'network',
    title: 'No pudimos cargar tu acceso',
    message: 'Revisa tu conexión y vuelve a cargar la página.',
  });
  return false;
};

/** Solo con alguno de estos permisos; si no, vuelve al inicio con un aviso. */
export function permissionGuard(...permissions: readonly Permission[]): CanActivateFn {
  return async () => {
    const access = inject(AdminAccess);
    const router = inject(Router);
    const alerts = inject(AlertService);
    if ((await access.load()) === 'granted' && permissions.some((p) => access.can(p))) {
      return true;
    }
    void alerts.warning('Sin permiso', 'Tu rol no tiene acceso a esa sección del panel.');
    return router.parseUrl('/');
  };
}
