/**
 * Conversión entre fechas ISO (UTC, como las guarda la API) y el valor de un
 * `<input type="datetime-local">` en la zona de la oferta (America/Mexico_City
 * por defecto), para que el equipo escriba siempre en hora CDMX sin importar
 * la zona de su navegador.
 */
export const OFFER_TIMEZONE = 'America/Mexico_City';

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

/** ISO → "YYYY-MM-DDTHH:mm" en la zona (vacío si no hay fecha). */
export function isoToZonedInput(iso: string | null | undefined, timeZone = OFFER_TIMEZONE): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const p = parts(date, timeZone);
  return `${p['year']}-${pad(p['month'])}-${pad(p['day'])}T${pad(p['hour'])}:${pad(p['minute'])}`;
}

/** "YYYY-MM-DDTHH:mm" en la zona → ISO UTC (`null` si está vacío o es inválido). */
export function zonedInputToIso(
  value: string | null | undefined,
  timeZone = OFFER_TIMEZONE,
): string | null {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, y, mo, d, h, mi] = match.map(Number);
  const wallClock = Date.UTC(y, mo - 1, d, h, mi);
  // Dos pasadas para acertar el desfase cerca de un cambio de horario.
  let instant = wallClock - offsetAt(wallClock, timeZone);
  instant = wallClock - offsetAt(instant, timeZone);
  return new Date(instant).toISOString();
}

const display = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeZone: OFFER_TIMEZONE });

/** Fecha legible en hora CDMX ("22 oct 2026"). */
export const formatOfferDate = (iso: string | null): string | null =>
  iso ? display.format(new Date(iso)) : null;
