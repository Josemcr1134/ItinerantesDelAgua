import { ApplicationStatus, ApplicationTimelineStep, OfferScheduleDto } from 'data-access';
import { TIMELINE_LABELS } from '../../shared/applications/application-labels';
import { timeIn } from '../calendar/calendar-time';

/** Hora oficial de los horarios y de las entrevistas (HU-11). */
export const CDMX = 'America/Mexico_City';

/** Color de la pastilla de estado (Figma: amarilla si hay que actuar, verde, gris o roja). */
export type StatusTone = 'neutral' | 'action' | 'ok' | 'muted' | 'danger';

export const STATUS_TONES: Readonly<Record<ApplicationStatus, StatusTone>> = {
  DRAFT: 'neutral',
  SUBMITTED: 'neutral',
  IN_REVIEW: 'neutral',
  INTERVIEW_SCHEDULED: 'ok',
  APPROVED_PENDING_PAYMENT: 'action',
  APPROVED_PENDING_CONFIRMATION: 'action',
  ENROLLED: 'ok',
  NOT_SELECTED: 'muted',
  EXPIRED: 'danger',
};

/** Postulaciones cerradas: van a la tabla de abajo, no como tarjeta. */
export const CLOSED_STATUSES: readonly ApplicationStatus[] = ['NOT_SELECTED', 'EXPIRED'];

/** Pasos del seguimiento (Figma: "Pago" en lugar de "Pago del saldo"). */
export const STEP_LABELS: Readonly<Record<ApplicationTimelineStep, string>> = {
  ...TIMELINE_LABELS,
  PAYMENT: 'Pago',
};

const DAYS = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'] as const;

/** Días ISO (1 = lunes) a "Sáb y dom" o "Lun, mié y vie". */
export function weekdaysLabel(weekdays: readonly number[]): string {
  const names = [...weekdays].sort((a, b) => a - b).map((d) => DAYS[(d - 1) % 7]);
  const text =
    names.length > 1 ? `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}` : names[0];
  return text ? text[0].toUpperCase() + text.slice(1) : '';
}

/** "Sáb y dom 10:00–13:00 CDMX". */
export function scheduleLabel(schedule: OfferScheduleDto): string {
  return `${weekdaysLabel(schedule.weekdays)} ${schedule.startTime}–${schedule.endTime} CDMX`;
}

/** "Bogota" (último tramo de la zona IANA). */
export function zoneName(timeZone: string): string {
  return (timeZone.split('/').pop() ?? timeZone).replace(/_/g, ' ');
}

/** "11:00–14:00 Bogota": el horario en la zona de la persona (null si es la de CDMX). */
export function localScheduleLabel(schedule: OfferScheduleDto, timeZone: string): string | null {
  const first = schedule.firstSession;
  if (!first || timeZone === CDMX) return null;
  return `${timeIn(first.startsAt, timeZone)}–${timeIn(first.endsAt, timeZone)} ${zoneName(timeZone)}`;
}

/** "jue 7 ene 2027" en la zona de la persona. */
export function weekdayDateIn(iso: string, timeZone: string): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('es', {
      timeZone,
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
      .formatToParts(new Date(iso))
      .map((part) => [part.type, part.value.replace(/\./g, '')]),
  );
  return `${p['weekday']} ${p['day']} ${p['month']} ${p['year']}`;
}

/** Días naturales que faltan hasta la fecha ("faltan 5 días", "vence hoy"). */
export function daysLeftLabel(iso: string, now = new Date()): string {
  const days = Math.ceil((new Date(iso).getTime() - now.getTime()) / 86_400_000);
  if (days <= 0) return 'vence hoy';
  return days === 1 ? 'falta 1 día' : `faltan ${days} días`;
}
