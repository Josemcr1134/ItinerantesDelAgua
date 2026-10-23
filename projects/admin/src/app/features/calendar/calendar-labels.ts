import { AdminCalendarItemKind, CalendarCategory, LibraryAudience } from 'data-access';
import { isoToZonedInput, zonedInputToIso } from '../offers/shared/zoned-time';

/** Tipo de elemento del calendario. TODO(contenido): validar con el equipo. */
export const CALENDAR_KIND_LABELS: Readonly<Record<AdminCalendarItemKind, string>> = {
  SESSION: 'Sesión',
  MANUAL: 'Evento',
  ENROLLMENT_OPENS: 'Apertura de inscripciones',
  ENROLLMENT_CLOSES: 'Cierre de inscripciones',
  OFFER_STARTS: 'Inicio de clases',
  SCHOLARSHIP_DEADLINE: 'Cierre de becas',
  FINAL_PROJECT: 'Entrega del proyecto final',
};

/** Audiencia de un evento (HU-10). */
export const AUDIENCE_LABELS: Readonly<Record<LibraryAudience, string>> = {
  ALL_REGISTERED: 'Todas las personas registradas',
  OFFER_ENROLLED: 'Solo inscritos de una oferta',
};

/** Clase de color de cada categoría: Formación azul, Territorio verde, Comunidad naranja, Eventos morado, Fechas importantes rojo. */
export const CATEGORY_CLASS: Readonly<Record<CalendarCategory, string>> = {
  TRAINING: 'adm-cat--training',
  TERRITORY: 'adm-cat--territory',
  COMMUNITY: 'adm-cat--community',
  EVENTS: 'adm-cat--events',
  IMPORTANT_DATES: 'adm-cat--important',
};

/** Un día de la cuadrícula del mes (fecha CDMX `AAAA-MM-DD`). */
export interface CalendarDay {
  readonly key: string;
  readonly day: number;
  readonly inMonth: boolean;
  readonly weekend: boolean;
}

const pad = (n: number) => String(n).padStart(2, '0');
/** `AAAA-MM-DD` de una fecha en UTC (solo aritmética de calendario). */
const keyOf = (date: Date) =>
  `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;

/** Hoy en CDMX (`AAAA-MM-DD`). */
export const todayKey = (): string => isoToZonedInput(new Date().toISOString()).slice(0, 10);

/** Fecha CDMX (`AAAA-MM-DD`) de un instante ISO. */
export const dayKeyOf = (iso: string): string => isoToZonedInput(iso).slice(0, 10);

/** `AAAA-MM` válido o el mes actual. */
export function normalizeMonth(month: string | undefined): string {
  return month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month) ? month : todayKey().slice(0, 7);
}

/** Mes anterior o siguiente (`delta` = ±1). */
export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  return keyOf(new Date(Date.UTC(y, m - 1 + delta, 1))).slice(0, 7);
}

/**
 * Cuadrícula de 6 semanas (de lunes a domingo) que contiene el mes, con el
 * rango para pedir a la API (`to` exclusivo; 42 días, dentro del máximo de 62).
 */
export function monthGrid(month: string): { days: CalendarDay[]; from: string; to: string } {
  const [y, m] = month.split('-').map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const offset = (first.getUTCDay() + 6) % 7; // lunes = 0
  const start = new Date(Date.UTC(y, m - 1, 1 - offset));
  const days: CalendarDay[] = Array.from({ length: 42 }, (_, i) => {
    const date = new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + i),
    );
    const weekday = date.getUTCDay();
    return {
      key: keyOf(date),
      day: date.getUTCDate(),
      inMonth: date.getUTCMonth() === m - 1,
      weekend: weekday === 0 || weekday === 6,
    };
  });
  const end = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + 42),
  );
  return {
    days,
    from: zonedInputToIso(`${days[0].key}T00:00`) ?? '',
    to: zonedInputToIso(`${keyOf(end)}T00:00`) ?? '',
  };
}

const monthTitle = new Intl.DateTimeFormat('es-MX', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** "Octubre de 2026". */
export function formatMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  const text = monthTitle.format(new Date(Date.UTC(y, m - 1, 1)));
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const dayTitle = new Intl.DateTimeFormat('es-MX', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
});

/** "Lunes, 9 de noviembre" de `AAAA-MM-DD`. */
export function formatDayKey(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const text = dayTitle.format(new Date(Date.UTC(y, m - 1, d)));
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const time = new Intl.DateTimeFormat('es-MX', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'America/Mexico_City',
});

/** "18:00" (CDMX). */
export const formatTime = (iso: string): string => time.format(new Date(iso));
