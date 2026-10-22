import { Role, RoleDefinitionDto, UserStatus } from 'data-access';
import { ROLE_LABELS, STAFF_ROLES } from 'auth';

/**
 * Roles del equipo para asignar: los del catálogo de la API (con su nombre y
 * permisos) o, si no cargó, la lista conocida sin permisos.
 */
export function teamRoles(catalog: readonly RoleDefinitionDto[]): readonly RoleDefinitionDto[] {
  const fromApi = catalog.filter((def) => def.role !== 'PARTICIPANT');
  return fromApi.length
    ? fromApi
    : STAFF_ROLES.map((role) => ({ role, label: ROLE_LABELS[role], permissions: [] }));
}

/** Roles del equipo de una cuenta (sin `PARTICIPANT`). */
export const staffRolesOf = (roles: readonly Role[]): Role[] =>
  roles.filter((role) => role !== 'PARTICIPANT');

export const STATUS_LABELS: Readonly<Record<UserStatus, string>> = {
  ACTIVE: 'Activa',
  DISABLED: 'Deshabilitada',
  PENDING_VERIFICATION: 'Sin verificar',
};

const dateTime = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' });

/** Fecha y hora legibles ("22 oct 2026, 10:15"). */
export const formatDateTime = (iso: string | null): string | null =>
  iso ? dateTime.format(new Date(iso)) : null;
