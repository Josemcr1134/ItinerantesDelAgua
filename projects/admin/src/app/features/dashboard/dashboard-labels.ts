import { DashboardTaskKey, EnrollmentSource, EnrollmentStatusCountsDto } from 'data-access';
import { NavIcon } from '../../core/navigation';

/** Pantalla a la que lleva cada pendiente del inicio (el texto lo da la API). */
export interface TaskLink {
  readonly icon: NavIcon;
  readonly path: string;
  readonly queryParams?: Readonly<Record<string, string>>;
}

export const TASK_LINKS: Readonly<Record<DashboardTaskKey, TaskLink>> = {
  APPLICATIONS_TO_REVIEW: { icon: 'applications', path: '/postulaciones' },
  INTERVIEWS_SCHEDULED: {
    icon: 'applications',
    path: '/postulaciones',
    queryParams: { estado: 'INTERVIEW_SCHEDULED' },
  },
  APPROVED_PENDING: { icon: 'follow-up', path: '/seguimiento' },
  TRANSFERS_TO_VALIDATE: {
    icon: 'payments',
    path: '/pagos',
    queryParams: { pestana: 'transferencias' },
  },
  PLANS_DELINQUENT: { icon: 'payments', path: '/pagos', queryParams: { pestana: 'planes' } },
  REFUNDS_PENDING: { icon: 'payments', path: '/pagos', queryParams: { pestana: 'reembolsos' } },
  CONTACT_UNREAD: { icon: 'contact', path: '/mensajes' },
  SESSIONS_NEXT_7_DAYS: { icon: 'calendar', path: '/calendario' },
};

export const ENROLLMENT_SOURCE_LABELS: Readonly<Record<EnrollmentSource, string>> = {
  FREE_SIGNUP: 'Registro gratuito',
  PAYMENT: 'Pago único',
  INSTALLMENTS: 'Pago en cuotas',
  SCHOLARSHIP: 'Beca',
  OPEN_CALL: 'Convocatoria',
  MOODLE_LIST: 'Lista de Moodle',
  MOODLE_ACCESS_CODE: 'Código de acceso',
  MANUAL: 'Manual',
};

/**
 * Colores de las series, siempre en este orden (validados sobre blanco:
 * contraste ≥ 3:1 y distinguibles con daltonismo). Verde, oro, azul,
 * terracota y violeta.
 */
export const SERIES_COLORS = ['#399f71', '#c48a00', '#0067ff', '#b5452b', '#7a5cc4'] as const;

/** Estados de las inscripciones, en el orden de la barra apilada. */
export const ENROLLMENT_STATES: readonly {
  readonly key: keyof EnrollmentStatusCountsDto;
  readonly label: string;
}[] = [
  { key: 'active', label: 'Activas' },
  { key: 'pendingPayment', label: 'Pendientes de pago' },
  { key: 'completed', label: 'Completadas' },
  { key: 'suspended', label: 'Suspendidas' },
  { key: 'cancelled', label: 'Canceladas' },
];

/** Periodos del resumen (`?periodo=` en días). */
export const PERIODS = [
  { days: 7, label: '7 días', lead: 'los últimos 7 días' },
  { days: 30, label: '30 días', lead: 'los últimos 30 días' },
  { days: 90, label: '90 días', lead: 'los últimos 90 días' },
  { days: 365, label: '12 meses', lead: 'los últimos 12 meses' },
] as const;
export const DEFAULT_PERIOD = 30;
