import { OfferScheduleDto } from 'data-access';
import { dateRange, formatMoney, scheduleLines, shortDate, weekdaysLabel } from './catalog-format';

const schedule = {
  timezone: 'America/Mexico_City',
  weekdays: [7, 6],
  startTime: '10:00',
  endTime: '13:00',
  firstSession: { startsAt: '2026-11-07T16:00:00.000Z', endsAt: '2026-11-07T19:00:00.000Z' },
} as OfferScheduleDto;

describe('catalog-format', () => {
  it('rangos de fechas en la zona', () => {
    const zone = 'America/Mexico_City';
    expect(dateRange('2026-11-07T16:00:00Z', '2027-03-31T16:00:00Z', zone)).toBe(
      '7 nov 2026 – 31 mar 2027',
    );
    expect(dateRange('2027-04-13T16:00:00Z', '2027-04-17T16:00:00Z', zone)).toBe('13–17 abr 2027');
    expect(dateRange(null, null, zone)).toBeNull();
    expect(shortDate('2026-10-01T16:00:00Z', zone, new Date('2026-10-26T00:00:00Z'))).toBe('1 oct');
  });

  it('horario en CDMX y en la zona de quien visita', () => {
    expect(weekdaysLabel([1, 3, 5])).toBe('Lun, mié y vie');
    expect(scheduleLines(schedule, 'America/Bogota')).toEqual({
      cdmx: 'Sáb y dom · 10:00–13:00',
      local: { time: '11:00–14:00', zone: 'Bogota' },
    });
    expect(scheduleLines(schedule, 'America/Mexico_City').local).toBeNull();
  });

  it('montos con su moneda', () => {
    expect(formatMoney({ amountCents: 58500, currency: 'USD' })).toBe('$585 USD');
    expect(formatMoney({ amountCents: 450050, currency: 'MXN' })).toBe('$4,500.50 MXN');
  });
});
