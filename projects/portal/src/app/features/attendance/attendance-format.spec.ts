import { remainingLabel } from './attendance-format';

describe('remainingLabel', () => {
  const now = new Date('2026-10-26T12:00:00.000Z').getTime();

  it('cuenta horas y minutos hasta el cierre', () => {
    expect(remainingLabel('2026-10-27T09:35:00.000Z', now)).toBe('21 h 35 min');
    expect(remainingLabel('2026-10-26T14:00:00.000Z', now)).toBe('2 h');
    expect(remainingLabel('2026-10-26T12:35:00.000Z', now)).toBe('35 min');
    expect(remainingLabel('2026-10-26T12:00:30.000Z', now)).toBe('menos de 1 min');
    expect(remainingLabel('2026-10-26T11:00:00.000Z', now)).toBeNull();
  });
});
