import { OfferScheduleDto } from 'data-access';
import {
  daysLeftLabel,
  localScheduleLabel,
  scheduleLabel,
  weekdayDateIn,
  weekdaysLabel,
} from './scholarship-format';

const schedule = {
  timezone: 'America/Mexico_City',
  weekdays: [7, 6],
  startTime: '10:00',
  endTime: '13:00',
  firstSession: { startsAt: '2027-01-16T16:00:00.000Z', endsAt: '2027-01-16T19:00:00.000Z' },
} as OfferScheduleDto;

describe('scholarship-format', () => {
  it('nombra los días del horario', () => {
    expect(weekdaysLabel([6, 7])).toBe('Sáb y dom');
    expect(weekdaysLabel([5, 1, 3])).toBe('Lun, mié y vie');
    expect(weekdaysLabel([2])).toBe('Mar');
  });

  it('da el horario en CDMX y en la zona de la persona', () => {
    expect(scheduleLabel(schedule)).toBe('Sáb y dom 10:00–13:00 CDMX');
    expect(localScheduleLabel(schedule, 'America/Bogota')).toBe('11:00–14:00 Bogota');
    expect(localScheduleLabel(schedule, 'America/Mexico_City')).toBeNull();
  });

  it('fecha con día de la semana y cuenta regresiva', () => {
    expect(weekdayDateIn('2027-01-07T16:00:00.000Z', 'America/Bogota')).toBe('jue 7 ene 2027');
    const now = new Date('2026-12-22T15:00:00.000Z');
    expect(daysLeftLabel('2026-12-27T15:00:00.000Z', now)).toBe('faltan 5 días');
    expect(daysLeftLabel('2026-12-23T10:00:00.000Z', now)).toBe('falta 1 día');
    expect(daysLeftLabel('2026-12-22T10:00:00.000Z', now)).toBe('vence hoy');
  });
});
