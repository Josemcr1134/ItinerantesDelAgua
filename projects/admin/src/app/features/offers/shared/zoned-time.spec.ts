import { isoToZonedInput, zonedInputToIso } from './zoned-time';

describe('zoned-time (hora CDMX)', () => {
  it('convierte ISO a la hora de la Ciudad de México y de vuelta', () => {
    // CDMX es UTC-6 (sin horario de verano desde 2022).
    expect(isoToZonedInput('2026-11-07T16:00:00.000Z')).toBe('2026-11-07T10:00');
    expect(zonedInputToIso('2026-11-07T10:00')).toBe('2026-11-07T16:00:00.000Z');
  });

  it('funciona en otras zonas (ida y vuelta)', () => {
    const iso = '2026-03-08T12:30:00.000Z';
    expect(zonedInputToIso(isoToZonedInput(iso, 'America/New_York'), 'America/New_York')).toBe(iso);
  });

  it('ignora valores vacíos o inválidos', () => {
    expect(isoToZonedInput(null)).toBe('');
    expect(zonedInputToIso('')).toBeNull();
    expect(zonedInputToIso('mañana')).toBeNull();
  });
});
