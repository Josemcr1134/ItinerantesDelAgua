import { AdminSessionState, ImportantDateKind, SessionExclusionReason } from 'data-access';
import { OFFER_TIMEZONE } from '../shared/zoned-time';

/** Chip del registro de asistencia (HU-30). TODO(contenido): validar con el equipo. */
export const SESSION_STATE_LABELS: Readonly<Record<AdminSessionState, string>> = {
  SCHEDULED: 'Programada',
  REGISTRATION_OPEN: 'Registro abierto',
  CLOSED: 'Cerrada',
  CANCELLED: 'Cancelada',
};

/** Tono de la insignia (`adm-badge--<tono>`). */
export const SESSION_STATE_TONES: Readonly<Record<AdminSessionState, string>> = {
  SCHEDULED: 'info',
  REGISTRATION_OPEN: 'success',
  CLOSED: 'neutral',
  CANCELLED: 'danger',
};

export const EXCLUSION_REASON_LABELS: Readonly<Record<SessionExclusionReason, string>> = {
  MANUAL: 'Receso',
  MX_HOLIDAY: 'Festivo en México',
};

export const IMPORTANT_DATE_LABELS: Readonly<Record<ImportantDateKind, string>> = {
  ENROLLMENT_OPENS: 'Apertura de inscripciones',
  ENROLLMENT_CLOSES: 'Cierre de inscripciones',
  OFFER_STARTS: 'Inicio de clases',
  SCHOLARSHIP_DEADLINE: 'Cierre de becas',
  FINAL_PROJECT: 'Entrega del proyecto final',
};

/** Enlace de videollamada admitido: https de zoom.us o meet.google.com. */
export const MEETING_URL = /^https:\/\/(([\w-]+\.)*zoom\.us|meet\.google\.com)\/\S+$/i;
export const HTTPS_URL = /^https:\/\/\S+$/i;

const day = new Intl.DateTimeFormat('es-MX', {
  weekday: 'long',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: OFFER_TIMEZONE,
});
const time = new Intl.DateTimeFormat('es-MX', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: OFFER_TIMEZONE,
});

/** "lunes, 9 nov 2026" (CDMX), para frases. */
export const formatSessionDay = (iso: string): string => day.format(new Date(iso));

/** "Lunes, 9 nov 2026", como título de una sesión. */
export const sessionDayTitle = (iso: string): string => {
  const text = formatSessionDay(iso);
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/** "18:00–20:00" (CDMX). */
export const formatSessionTime = (startsAt: string, endsAt: string): string =>
  `${time.format(new Date(startsAt))}–${time.format(new Date(endsAt))}`;

/** "lunes, 9 nov 2026 · 18:00–20:00". */
export const formatSessionSlot = (startsAt: string, endsAt: string): string =>
  `${formatSessionDay(startsAt)} · ${formatSessionTime(startsAt, endsAt)}`;

/** Duración en horas ("2 h", "1.5 h"). */
export const sessionHours = (startsAt: string, endsAt: string): number =>
  (Date.parse(endsAt) - Date.parse(startsAt)) / 3_600_000;

/** "Se avisó a 12 inscritos." (o nada si no se avisó a nadie). */
export function notifiedText(count: number): string {
  if (!count) return '';
  return ` Se avisó a ${count} ${count === 1 ? 'inscrito' : 'inscritos'}.`;
}
