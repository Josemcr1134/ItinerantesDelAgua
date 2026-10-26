import {
  AttendanceStatus,
  ModuleStatus,
  OfferType,
  RecordingState,
  SessionCardDto,
} from 'data-access';
import { timeIn } from '../calendar/calendar-time';
import { CDMX, weekdayDateIn } from '../scholarships/scholarship-format';

/** TODO(contenido): validar los textos del aula con el equipo (HU-08 / HU-17). */
export const OFFER_TYPE_LABELS: Readonly<Partial<Record<OfferType, string>>> = {
  DIPLOMA: 'Diplomado',
  COURSE: 'Curso',
  WORKSHOP: 'Taller',
};

export const MODULE_STATUS_LABELS: Readonly<Record<ModuleStatus, string>> = {
  UPCOMING: 'Próximo',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Completado',
};

export const RECORDING_LABELS: Readonly<Record<RecordingState, string>> = {
  AVAILABLE: 'Ver grabación',
  AFTER_SESSION: 'Disponible después de la sesión',
  PENDING: 'Grabación pendiente',
  NOT_APPLICABLE: 'Sin grabación',
};

export const ATTENDANCE_LABELS: Readonly<Record<AttendanceStatus, string>> = {
  PENDING: 'Asistencia pendiente',
  REGISTERED: 'Asistencia registrada',
  NOT_REGISTERED: 'Asistencia no registrada',
  NOT_APPLICABLE: 'Sin registro de asistencia',
};

/**
 * Estado de asistencia de una sesión del participante. El esquema publicado
 * de `SessionCardDto.attendance` quedó con el de administración (mismo
 * nombre en la API); se lee `status` solo si llega con la forma esperada.
 */
export function attendanceOf(session: SessionCardDto): AttendanceStatus | null {
  const attendance: unknown = session.attendance;
  if (typeof attendance !== 'object' || attendance === null || !('status' in attendance)) {
    return null;
  }
  const status = attendance.status;
  return typeof status === 'string' && status in ATTENDANCE_LABELS
    ? (status as AttendanceStatus)
    : null;
}

/** "jue 29 oct 2026 · 18:00–20:00" en la zona de la persona. */
export function sessionWhen(session: Pick<SessionCardDto, 'startsAt' | 'endsAt'>, zone: string) {
  return `${weekdayDateIn(session.startsAt, zone)} · ${timeIn(session.startsAt, zone)}–${timeIn(session.endsAt, zone)}`;
}

/** "18:00 CDMX" (null si la persona ya está en la zona de CDMX). */
export function cdmxTime(iso: string, zone: string): string | null {
  return zone === CDMX ? null : `${timeIn(iso, CDMX)} CDMX`;
}

/** "2.4 MB" o "350 KB". */
export function fileSize(bytes: number | null): string | null {
  if (bytes === null) return null;
  return bytes >= 1_048_576
    ? `${(bytes / 1_048_576).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Día y mes para la ficha de una sesión ("29" / "oct"). */
export function dayParts(iso: string, timeZone: string): { day: string; month: string } {
  const parts = new Intl.DateTimeFormat('es', { timeZone, day: 'numeric', month: 'short' })
    .formatToParts(new Date(iso))
    .reduce<Record<string, string>>((acc, p) => ({ ...acc, [p.type]: p.value }), {});
  return { day: parts['day'] ?? '', month: (parts['month'] ?? '').replace(/\./g, '') };
}
