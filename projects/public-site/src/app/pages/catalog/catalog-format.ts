import { MoneyDto, OfferScheduleDto } from 'data-access';

/** Hora oficial de los horarios (HU-11). */
export const CDMX = 'America/Mexico_City';

/** Zona IANA del navegador (define la moneda sin sesión). */
export function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || CDMX;
  } catch {
    return CDMX;
  }
}

const clean = (text: string) => text.replace(/\./g, '');
type Parts = Record<'day' | 'month' | 'year', string>;
const partsOf = (iso: string, timeZone: string): Parts =>
  Object.fromEntries(
    new Intl.DateTimeFormat('es', { timeZone, day: 'numeric', month: 'short', year: 'numeric' })
      .formatToParts(new Date(iso))
      .map((p) => [p.type, clean(p.value)]),
  ) as Parts;

/** "13–17 abr 2027", "7 nov 2026 – 31 mar 2027" o "21 nov 2026" (en la zona). */
export function dateRange(startsAt: string | null, endsAt: string | null, timeZone: string) {
  if (!startsAt) return null;
  const a = partsOf(startsAt, timeZone);
  if (!endsAt) return `${a.day} ${a.month} ${a.year}`;
  const b = partsOf(endsAt, timeZone);
  if (a.year !== b.year) return `${a.day} ${a.month} ${a.year} – ${b.day} ${b.month} ${b.year}`;
  if (a.month !== b.month) return `${a.day} ${a.month} – ${b.day} ${b.month} ${b.year}`;
  return a.day === b.day
    ? `${a.day} ${a.month} ${a.year}`
    : `${a.day}–${b.day} ${a.month} ${a.year}`;
}

/** "1 oct" (con el año si no es el actual). */
export function shortDate(iso: string, timeZone: string, now = new Date()): string {
  const p = partsOf(iso, timeZone);
  const year = partsOf(now.toISOString(), timeZone).year;
  return p.year === year ? `${p.day} ${p.month}` : `${p.day} ${p.month} ${p.year}`;
}

const DAYS = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'] as const;

/** Días ISO (1 = lunes) a "Sáb y dom" o "Lun, mié y vie". */
export function weekdaysLabel(weekdays: readonly number[]): string {
  const names = [...weekdays].sort((a, b) => a - b).map((d) => DAYS[(d - 1) % 7]);
  const text =
    names.length > 1 ? `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}` : names[0];
  return text ? text[0].toUpperCase() + text.slice(1) : '';
}

const time = (iso: string, timeZone: string) =>
  new Intl.DateTimeFormat('es', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(iso));

/** Ciudad de la zona IANA ("America/Bogota" → "Bogota"). */
const zoneName = (timeZone: string) => (timeZone.split('/').pop() ?? timeZone).replace(/_/g, ' ');

/**
 * Horario: "Sáb y dom · 10:00–13:00" (CDMX) y, si la persona está en otra
 * zona, "11:00–14:00" con su ciudad (de la primera sesión, en UTC).
 */
export function scheduleLines(schedule: OfferScheduleDto, timeZone: string) {
  const days = weekdaysLabel(schedule.weekdays);
  const cdmx = `${days ? `${days} · ` : ''}${schedule.startTime}–${schedule.endTime}`;
  const first = schedule.firstSession;
  const local =
    first && timeZone !== CDMX
      ? {
          time: `${time(first.startsAt, timeZone)}–${time(first.endsAt, timeZone)}`,
          zone: zoneName(timeZone),
        }
      : null;
  return { cdmx, local };
}

/** "$1,500 MXN" o "$292.50 USD" (centavos de la API). */
export function formatMoney(money: MoneyDto): string {
  const amount = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: money.currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: money.amountCents % 100 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(money.amountCents / 100);
  return `${amount} ${money.currency}`;
}

/** "10%–80%" o "50%". */
export const percentRange = (min: number, max: number) =>
  min === max ? `${min}%` : `${min}%–${max}%`;
