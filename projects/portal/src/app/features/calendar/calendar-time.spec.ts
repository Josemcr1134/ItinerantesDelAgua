import {
  addMonths,
  dayKeyIn,
  dayStartIso,
  durationLabel,
  formatMonth,
  monthGrid,
  weekStart,
} from './calendar-time';

describe('calendar-time', () => {
  it('la cuadrícula del mes empieza en domingo y tiene 6 semanas', () => {
    const days = monthGrid('2026-10-09');
    expect(days).toHaveLength(42);
    expect(days[0]).toEqual({ key: '2026-09-27', day: 27, inMonth: false });
    expect(days.find((d) => d.key === '2026-10-01')?.inMonth).toBe(true);
    expect(weekStart('2026-10-14')).toBe('2026-10-11');
  });

  it('la medianoche del día en la zona de la persona, en UTC', () => {
    expect(dayStartIso('2026-10-01', 'America/Mexico_City')).toBe('2026-10-01T06:00:00.000Z');
    expect(dayStartIso('2026-10-01', 'America/Bogota')).toBe('2026-10-01T05:00:00.000Z');
    expect(dayKeyIn('2026-10-02T04:30:00.000Z', 'America/Mexico_City')).toBe('2026-10-01');
  });

  it('textos de mes y duración', () => {
    expect(formatMonth('2026-10-09')).toBe('Octubre 2026');
    expect(addMonths('2026-12-31', 1)).toBe('2027-01-01');
    expect(durationLabel('2026-10-01T15:00:00Z', '2026-10-01T16:30:00Z')).toBe('1 h 30 min');
    expect(durationLabel('2026-10-01T15:00:00Z', '2026-10-01T15:30:00Z')).toBe('30 min');
    expect(durationLabel('2026-10-01T15:00:00Z', null)).toBeNull();
  });
});
