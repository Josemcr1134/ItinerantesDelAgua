/** Zona del navegador; la del perfil manda cuando existe (HU-11). */
export function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Mexico_City';
  } catch {
    return 'America/Mexico_City';
  }
}

const dayKey = (date: Date, timeZone: string) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

/** "Hoy - 18:00", "Mañana - 09:30" o "lun 3 nov - 18:00", en la zona indicada. */
export function dayTimeLabel(iso: string, timeZone: string, now = new Date()): string {
  const date = new Date(iso);
  const time = new Intl.DateTimeFormat('es', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date);
  const tomorrow = new Date(now.getTime() + 86_400_000);
  const key = dayKey(date, timeZone);
  const day =
    key === dayKey(now, timeZone)
      ? 'Hoy'
      : key === dayKey(tomorrow, timeZone)
        ? 'Mañana'
        : new Intl.DateTimeFormat('es', {
            timeZone,
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          })
            .format(date)
            .replace(/\./g, '')
            .replace(/,/g, '');
  return `${day} - ${time}`;
}

/** Hora sola ("18:00") en la zona indicada. */
export function timeLabel(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat('es', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(iso));
}
