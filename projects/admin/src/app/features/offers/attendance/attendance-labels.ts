import { AttendanceSource, AttendanceStatus, EnrollmentStatus } from 'data-access';

/** Textos de la asistencia (HU-30). TODO(contenido): validar con el equipo. */
export const ATTENDANCE_STATUS_LABELS: Readonly<Record<AttendanceStatus, string>> = {
  REGISTERED: 'Registrada',
  PENDING: 'Pendiente',
  NOT_REGISTERED: 'No registrada',
  NOT_APPLICABLE: 'No aplica',
};

/** Tono de la insignia (`adm-badge--<tono>`). */
export const ATTENDANCE_STATUS_TONES: Readonly<Record<AttendanceStatus, string>> = {
  REGISTERED: 'success',
  PENDING: 'pending',
  NOT_REGISTERED: 'danger',
  NOT_APPLICABLE: 'neutral',
};

export const ATTENDANCE_SOURCE_LABELS: Readonly<Record<AttendanceSource, string>> = {
  PARTICIPANT: 'Participante',
  MANUAL: 'Manual',
};

export const ENROLLMENT_STATUS_LABELS: Readonly<Record<EnrollmentStatus, string>> = {
  PENDING_PAYMENT: 'Pendiente de pago',
  ACTIVE: 'Activa',
  COMPLETED: 'Completada',
  SUSPENDED: 'Suspendida',
  CANCELLED: 'Cancelada',
};
