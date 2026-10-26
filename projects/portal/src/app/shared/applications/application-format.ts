import { AmountRangeDto, MoneyDto, ScholarshipTypeSummaryDto } from 'data-access';

const clean = (text: string) => text.replace(/\./g, '');

/** "31 ene 2027, 23:59" en la zona de la persona. */
export function dateTimeIn(iso: string, timeZone: string): string {
  const date = new Intl.DateTimeFormat('es', {
    timeZone,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
  const time = new Intl.DateTimeFormat('es', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(iso));
  return `${clean(date).replace(/ de /g, ' ')}, ${time}`;
}

/** "13–17 abr 2027", "30 abr – 2 may 2027" o "13 abr 2027" (en la zona). */
export function dateRange(
  startsAt: string | null,
  endsAt: string | null,
  timeZone: string,
): string | null {
  if (!startsAt) return null;
  const parts = (iso: string) =>
    Object.fromEntries(
      new Intl.DateTimeFormat('es', { timeZone, day: 'numeric', month: 'short', year: 'numeric' })
        .formatToParts(new Date(iso))
        .map((p) => [p.type, clean(p.value)]),
    ) as Record<'day' | 'month' | 'year', string>;
  const a = parts(startsAt);
  if (!endsAt) return `${a.day} ${a.month} ${a.year}`;
  const b = parts(endsAt);
  if (a.year !== b.year) return `${a.day} ${a.month} ${a.year} – ${b.day} ${b.month} ${b.year}`;
  if (a.month !== b.month) return `${a.day} ${a.month} – ${b.day} ${b.month} ${b.year}`;
  return a.day === b.day
    ? `${a.day} ${a.month} ${a.year}`
    : `${a.day}–${b.day} ${a.month} ${a.year}`;
}

/** "02 dic 2026" en la zona de la persona. */
export function dateIn(iso: string, timeZone: string): string {
  const date = new Intl.DateTimeFormat('es', {
    timeZone,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
  return clean(date).replace(/ de /g, ' ');
}

/** "$1,500" o "$292.50" (centavos de la API), sin la moneda. */
function amount(cents: number, currency: string): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: cents % 100 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/** "$1,500 MXN" o "$292.50 USD" (centavos de la API). */
export function formatMoney(money: MoneyDto): string {
  return `${amount(money.amountCents, money.currency)} ${money.currency}`;
}

/** "$292.50 USD" o "$117 – $175.50 USD" si el monto es un rango. */
export function formatAmountRange(range: AmountRangeDto): string {
  const min = amount(range.minAmountCents, range.currency);
  return range.minAmountCents === range.maxAmountCents
    ? `${min} ${range.currency}`
    : `${min} – ${amount(range.maxAmountCents, range.currency)} ${range.currency}`;
}

/** "50%" o "70%–80%" según el rango del tipo de beca. */
export function percentLabel(
  type: Pick<ScholarshipTypeSummaryDto, 'minPercent' | 'maxPercent'>,
): string {
  return type.minPercent === type.maxPercent
    ? `${type.minPercent}%`
    : `${type.minPercent}%–${type.maxPercent}%`;
}
