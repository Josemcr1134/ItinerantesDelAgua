import { MoneyDto } from 'data-access';

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

/** "$1,500 MXN" (centavos de la API). */
export function formatMoney(money: MoneyDto): string {
  const amount = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: money.currency,
    maximumFractionDigits: 0,
  }).format(money.amountCents / 100);
  return `${amount} ${money.currency}`;
}
