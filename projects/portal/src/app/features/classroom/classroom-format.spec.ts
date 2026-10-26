import { cdmxTime, dayParts, fileSize, sessionWhen } from './classroom-format';

describe('classroom-format', () => {
  it('da la sesión en la zona de la persona y la referencia CDMX', () => {
    const s = { startsAt: '2026-10-29T23:00:00.000Z', endsAt: '2026-10-30T01:00:00.000Z' };
    expect(sessionWhen(s, 'America/Bogota')).toBe('jue 29 oct 2026 · 18:00–20:00');
    expect(cdmxTime(s.startsAt, 'America/Bogota')).toBe('17:00 CDMX');
    expect(cdmxTime(s.startsAt, 'America/Mexico_City')).toBeNull();
    expect(dayParts(s.startsAt, 'America/Bogota')).toEqual({ day: '29', month: 'oct' });
  });

  it('tamaños legibles', () => {
    expect(fileSize(2_516_582)).toBe('2.4 MB');
    expect(fileSize(358_400)).toBe('350 KB');
    expect(fileSize(null)).toBeNull();
  });
});
