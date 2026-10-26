/** "21 h 35 min", "35 min" o "menos de 1 min" hasta la fecha (null si ya pasó). */
export function remainingLabel(iso: string, now: number): string | null {
  const minutes = Math.floor((new Date(iso).getTime() - now) / 60_000);
  if (minutes < 0) return null;
  if (minutes < 1) return 'menos de 1 min';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest} min`;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}
