import { InjectionToken } from '@angular/core';
import { Role } from 'data-access';

export interface AuthConfig {
  /** Nombre de la plataforma que se muestra en el login (p. ej. "Administrador"). */
  readonly platformName: string;
  /** Ruta del login. */
  readonly loginUrl: string;
  /** Ruta de recuperación de contraseña. */
  readonly forgotPasswordUrl: string;
  /** Ruta de la verificación del correo (cuenta sin verificar al iniciar sesión). */
  readonly verifyEmailUrl: string;
  /** Destino tras iniciar sesión cuando no hay `returnUrl`. */
  readonly homeUrl: string;
  /** Roles con acceso a la app; sin definir, cualquier cuenta activa entra. */
  readonly allowedRoles?: readonly Role[];
}

export const DEFAULT_AUTH_CONFIG: AuthConfig = {
  platformName: '',
  loginUrl: '/login',
  forgotPasswordUrl: '/recuperar-contrasena',
  verifyEmailUrl: '/verificar-correo',
  homeUrl: '/',
};

export const AUTH_CONFIG = new InjectionToken<AuthConfig>('AUTH_CONFIG', {
  factory: () => DEFAULT_AUTH_CONFIG,
});

/** Roles del equipo (todas las cuentas que no son de participante). */
export const STAFF_ROLES: readonly Role[] = [
  'SUPER_ADMIN',
  'ACADEMIC_COORDINATOR',
  'REVIEW_COMMITTEE',
  'REVIEW_DECIDER',
  'FOLLOW_UP',
  'FINANCE',
];

/** Nombre visible de cada rol. TODO(contenido): confirmar los nombres. */
export const ROLE_LABELS: Readonly<Record<Role, string>> = {
  PARTICIPANT: 'Participante',
  SUPER_ADMIN: 'Superadministrador',
  ACADEMIC_COORDINATOR: 'Coordinación académica',
  REVIEW_COMMITTEE: 'Comité de revisión',
  REVIEW_DECIDER: 'Decisión de revisión',
  FOLLOW_UP: 'Seguimiento',
  FINANCE: 'Finanzas',
};
