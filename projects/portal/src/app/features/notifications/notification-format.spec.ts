import { NotificationDto } from 'data-access';
import { groupByDay, notificationTarget, relativeTime } from './notification-format';

const zone = 'America/Mexico_City';
const notification = (id: string, createdAt: string, pinned = false) =>
  ({ id, createdAt, pinned }) as NotificationDto;

describe('notification-format', () => {
  const now = new Date('2026-10-26T20:00:00.000Z'); // 14:00 CDMX

  it('da el tiempo relativo en la zona de la persona', () => {
    expect(relativeTime('2026-10-26T19:59:40.000Z', zone, now)).toBe('ahora');
    expect(relativeTime('2026-10-26T19:55:00.000Z', zone, now)).toBe('hace 5 min');
    expect(relativeTime('2026-10-26T15:00:00.000Z', zone, now)).toBe('hace 5 h');
    expect(relativeTime('2026-10-26T00:30:00.000Z', zone, now)).toBe('ayer, 18:30');
    expect(relativeTime('2026-10-12T18:00:00.000Z', zone, now)).toBe('12 oct');
    expect(relativeTime('2025-12-12T18:00:00.000Z', zone, now)).toBe('12 dic 2025');
  });

  it('agrupa: fijadas primero y luego por día', () => {
    vi.useFakeTimers({ now });
    try {
      const groups = groupByDay(
        [
          notification('p', '2026-10-01T18:00:00.000Z', true),
          notification('a', '2026-10-26T18:00:00.000Z'),
          notification('b', '2026-10-25T18:00:00.000Z'),
          notification('c', '2026-10-12T18:00:00.000Z'),
        ],
        zone,
      );
      expect(groups.map((g) => [g.label, g.items.map((n) => n.id)])).toEqual([
        ['Importantes', ['p']],
        ['Hoy', ['a']],
        ['Ayer', ['b']],
        ['Lunes, 12 de octubre', ['c']],
      ]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('traduce la ruta de la acción al portal', () => {
    expect(notificationTarget('/portal/postulaciones/a1')).toEqual({ url: '/postulaciones/a1' });
    expect(notificationTarget('/portal')).toEqual({ url: '/' });
    expect(notificationTarget('/calendario?vista=dia')).toEqual({ url: '/calendario?vista=dia' });
    expect(notificationTarget('https://chat.whatsapp.com/x')).toEqual({
      external: 'https://chat.whatsapp.com/x',
    });
  });
});
