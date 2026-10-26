import { dayTimeLabel, timeLabel } from './dashboard-format';

describe('dayTimeLabel', () => {
  // 25 oct 2026, 12:00 en CDMX (UTC-6).
  const now = new Date('2026-10-25T18:00:00.000Z');
  const tz = 'America/Mexico_City';

  it('hoy, mañana u otro día, en la zona de la persona', () => {
    expect(dayTimeLabel('2026-10-26T00:00:00.000Z', tz, now)).toBe('Hoy - 18:00');
    expect(dayTimeLabel('2026-10-26T15:30:00.000Z', tz, now)).toBe('Mañana - 09:30');
    expect(dayTimeLabel('2026-10-29T00:00:00.000Z', tz, now)).toMatch(/^mié 28 oct - 18:00$/);
  });

  it('la misma hora cambia de día según la zona', () => {
    expect(dayTimeLabel('2026-10-26T00:00:00.000Z', 'Europe/Madrid', now)).toBe('Mañana - 01:00');
    expect(timeLabel('2026-10-26T00:00:00.000Z', 'America/Bogota')).toBe('19:00');
  });
});
