import { MoneyDto } from 'data-access';
import { OFFER_TIMEZONE } from '../../features/offers/shared/zoned-time';

const dateTime = new Intl.DateTimeFormat('es-MX', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: OFFER_TIMEZONE,
});

/** Fecha y hora en CDMX ("22 oct 2026, 10:30 a.m."). */
export const formatDateTime = (iso: string | null): string | null =>
  iso ? dateTime.format(new Date(iso)) : null;

const moneyFormats = new Map<string, Intl.NumberFormat>();

/** "$5,100.00 MXN" (los montos de la API van en centavos; MXN y USD nunca se suman). */
export function formatMoney(amount: MoneyDto | null | undefined): string | null {
  if (!amount) return null;
  let format = moneyFormats.get(amount.currency);
  if (!format) {
    format = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: amount.currency,
      currencyDisplay: 'narrowSymbol',
    });
    moneyFormats.set(amount.currency, format);
  }
  return `${format.format(amount.amountCents / 100)} ${amount.currency}`;
}
