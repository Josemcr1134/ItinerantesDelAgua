import {
  ATTENDANCE_SOURCE_VALUES,
  ATTENDANCE_STATUS_VALUES,
  AttendanceSource,
  AttendanceStatus,
  IsoDateTime,
  SessionCardDto,
} from './models.generated';

/**
 * Asistencia de una sesión vista por el participante (HU-18).
 *
 * El OpenAPI vigente publica `SessionCardDto.attendance` con el esquema de
 * administración (`SessionAttendanceDto`: mismo nombre en dos módulos de la
 * API), pero las rutas `/me/…` devuelven esta forma (versión anterior del
 * documento). Hasta que el backend lo corrija, se lee con
 * `participantAttendance()`, que valida la forma en tiempo de ejecución.
 */
export const ATTENDANCE_WINDOW_STATE_VALUES = [
  'NOT_OPEN_YET',
  'OPEN',
  'CLOSED',
  'NOT_APPLICABLE',
] as const;
export type AttendanceWindowState = (typeof ATTENDANCE_WINDOW_STATE_VALUES)[number];

export interface MySessionAttendanceDto {
  /** Pendiente / Registrada / No registrada (`NOT_APPLICABLE` en canceladas). */
  readonly status: AttendanceStatus;
  /** Ventana de registro: abre al terminar la sesión y dura `windowHours` (24 h por defecto). */
  readonly windowState: AttendanceWindowState;
  /** Fin de la sesión. */
  readonly opensAt: IsoDateTime;
  /** "Puedes registrar hasta el …" / "Cierra en 21 h 35 min". */
  readonly closesAt: IsoDateTime;
  readonly windowHours: number;
  /** Habilita [Registrar asistencia]. */
  readonly canRegister: boolean;
  /** "Asistencia registrada el …". */
  readonly registeredAt: IsoDateTime | null;
  /** `MANUAL` = la marcó el equipo (p. ej. pase de lista en sitio). */
  readonly source: AttendanceSource | null;
  readonly comment: string | null;
}

const isOneOf = <T extends string>(values: readonly T[], value: unknown): value is T =>
  typeof value === 'string' && (values as readonly string[]).includes(value);
const isDate = (value: unknown): value is string => typeof value === 'string';
const isNullableString = (value: unknown): value is string | null =>
  value === null || typeof value === 'string';

/** La asistencia de la sesión con la forma del participante, o `null` si no llega así. */
export function participantAttendance(
  session: Pick<SessionCardDto, 'attendance'>,
): MySessionAttendanceDto | null {
  const value: unknown = session.attendance;
  if (typeof value !== 'object' || value === null) return null;
  const a = value as Record<string, unknown>;
  if (
    !isOneOf(ATTENDANCE_STATUS_VALUES, a['status']) ||
    !isOneOf(ATTENDANCE_WINDOW_STATE_VALUES, a['windowState']) ||
    !isDate(a['opensAt']) ||
    !isDate(a['closesAt'])
  ) {
    return null;
  }
  const source = a['source'];
  return {
    status: a['status'],
    windowState: a['windowState'],
    opensAt: a['opensAt'],
    closesAt: a['closesAt'],
    windowHours: typeof a['windowHours'] === 'number' ? a['windowHours'] : 24,
    canRegister: a['canRegister'] === true,
    registeredAt: isNullableString(a['registeredAt']) ? a['registeredAt'] : null,
    source: isOneOf(ATTENDANCE_SOURCE_VALUES, source) ? source : null,
    comment: isNullableString(a['comment']) ? a['comment'] : null,
  };
}
