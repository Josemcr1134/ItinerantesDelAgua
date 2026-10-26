import { SessionCardDto } from './models.generated';
import { participantAttendance } from './participant-attendance';

const session = (attendance: unknown) => ({ attendance }) as unknown as SessionCardDto;

describe('participantAttendance', () => {
  it('lee la asistencia del participante', () => {
    expect(
      participantAttendance(
        session({
          status: 'PENDING',
          windowState: 'OPEN',
          opensAt: '2026-11-07T19:00:00.000Z',
          closesAt: '2026-11-08T19:00:00.000Z',
          windowHours: 24,
          canRegister: true,
          registeredAt: null,
          source: null,
          comment: null,
        }),
      ),
    ).toEqual({
      status: 'PENDING',
      windowState: 'OPEN',
      opensAt: '2026-11-07T19:00:00.000Z',
      closesAt: '2026-11-08T19:00:00.000Z',
      windowHours: 24,
      canRegister: true,
      registeredAt: null,
      source: null,
      comment: null,
    });
  });

  it('ignora otras formas (p. ej. la de administración)', () => {
    expect(participantAttendance(session({ session: {}, summary: {}, rows: [] }))).toBeNull();
    expect(participantAttendance(session({ status: 'OTRO', windowState: 'OPEN' }))).toBeNull();
    expect(participantAttendance(session(null))).toBeNull();
  });
});
