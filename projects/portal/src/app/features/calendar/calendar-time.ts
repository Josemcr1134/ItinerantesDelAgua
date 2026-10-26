/**
 * Fechas del calendario en la zona horaria de la persona (HU-10/HU-11). Los
 * días se manejan como claves `AAAA-MM-DD` y las horas de la API llegan en UTC.
 */

function parts(date: Date, timeZone: string): Record<string, number> {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  return Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)]),
  );
}

/** Desfase (ms) de la zona respecto de UTC en ese instante. */
function offsetAt(instant: number, timeZone: string): number {
  const p = parts(new Date(instant), timeZone);
  const asUtc = Date.UTC(p['year'], p['month'] - 1, p['day'], p['hour'], p['minute'], p['second']);
  return asUtc - Math.floor(instant / 1000) * 1000;
}

const pad = (n: number) => String(n).padStart(2, '0');
const keyOfUtc = (date: Date) =>
  `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
const utcOfKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

/** Día (`AAAA-MM-DD`) de un instante en la zona. */
export function dayKeyIn(iso: string | Date, timeZone: string): string {
  const p = parts(new Date(iso), timeZone);
  return `${p['year']}-${pad(p['month'])}-${pad(p['day'])}`;
}

/** Hoy en la zona. */
export const todayIn = (timeZone: string): string => dayKeyIn(new Date(), timeZone);

/** `AAAA-MM-DD` válido o `null`. */
export const isDayKey = (value: string | undefined): value is string =>
  !!value && /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value);

/** Suma días a una clave. */
export const addDays = (key: string, days: number): string => {
  const date = utcOfKey(key);
  date.setUTCDate(date.getUTCDate() + days);
  return keyOfUtc(date);
};

/** Suma meses (al día 1 del mes resultante). */
export const addMonths = (key: string, months: number): string => {
  const date = utcOfKey(key);
  return keyOfUtc(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1)));
};

/** Primer día del mes de la clave. */
export const monthStart = (key: string): string => `${key.slice(0, 7)}-01`;

/** Domingo de la semana de la clave (la semana del Figma empieza en domingo). */
export const weekStart = (key: string): string => addDays(key, -utcOfKey(key).getUTCDay());

/** Medianoche de ese día en la zona, como instante ISO (para `from`/`to` de la API). */
export function dayStartIso(key: string, timeZone: string): string {
  const wallClock = utcOfKey(key).getTime();
  // Dos pasadas para acertar el desfase cerca de un cambio de horario.
  let instant = wallClock - offsetAt(wallClock, timeZone);
  instant = wallClock - offsetAt(instant, timeZone);
  return new Date(instant).toISOString();
}

/** Un día de la cuadrícula. */
export interface GridDay {
  readonly key: string;
  readonly day: number;
  readonly inMonth: boolean;
}

/** Cuadrícula de 6 semanas (de domingo a sábado) que contiene el mes de la clave. */
export function monthGrid(key: string): GridDay[] {
  const start = weekStart(monthStart(key));
  const month = key.slice(0, 7);
  return Array.from({ length: 42 }, (_, i) => {
    const dayKey = addDays(start, i);
    return { key: dayKey, day: Number(dayKey.slice(8)), inMonth: dayKey.startsWith(month) };
  });
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const utcFormat = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('es', { ...options, timeZone: 'UTC' });
const monthTitle = utcFormat({ month: 'long', year: 'numeric' });
const dayTitle = utcFormat({ weekday: 'long', day: 'numeric', month: 'long' });
const shortDay = utcFormat({ day: 'numeric', month: 'short' });

/** "Octubre 2026". */
export const formatMonth = (key: string): string =>
  capitalize(monthTitle.format(utcOfKey(key)).replace(' de ', ' '));

/** "Viernes, 9 de octubre". */
export const formatDay = (key: string): string => capitalize(dayTitle.format(utcOfKey(key)));

/** "4 – 10 oct. 2026" para la semana que empieza en la clave. */
export function formatWeek(start: string): string {
  const end = addDays(start, 6);
  const year = end.slice(0, 4);
  return `${shortDay.format(utcOfKey(start)).replace('.', '')} – ${shortDay
    .format(utcOfKey(end))
    .replace('.', '')} ${year}`;
}

/** "18:00" en la zona. */
export const timeIn = (iso: string, timeZone: string): string =>
  new Intl.DateTimeFormat('es', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(iso));

/** Duración legible: "30 min", "2 h", "1 h 30 min". */
export function durationLabel(startsAt: string, endsAt: string | null): string | null {
  if (!endsAt) return null;
  const minutes = Math.round((new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60000);
  if (minutes <= 0) return null;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest} min`;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}
