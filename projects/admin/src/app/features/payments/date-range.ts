import { zonedInputToIso } from '../offers/shared/zoned-time';

/** Inicio del día (CDMX) de `AAAA-MM-DD` en ISO, o `undefined` si está vacío. */
export function dayStartIso(date: string): string | undefined {
  return (date && zonedInputToIso(`${date}T00:00`)) || undefined;
}

/** Último milisegundo del día (CDMX) de `AAAA-MM-DD` en ISO, o `undefined`. */
export function dayEndIso(date: string): string | undefined {
  if (!date) return undefined;
  const [y, m, d] = date.split('-').map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
  const start = zonedInputToIso(`${next}T00:00`);
  return start ? new Date(Date.parse(start) - 1).toISOString() : undefined;
}
