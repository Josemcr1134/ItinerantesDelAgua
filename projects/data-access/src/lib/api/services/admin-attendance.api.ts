import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import { Uuid } from '../models.generated';
import { ApiBody, ApiQuery, ApiResponse } from '../operations.generated';

export type ParticipantAttendanceQuery = ApiQuery<'AdminAttendance_participants'>;
export type SessionAttendanceQuery = ApiQuery<'AdminAttendance_session'>;

/** Asistencia de las sesiones de una oferta (HU-30). Ver: `attendance.read`; marcar: `attendance.write`. */
@Injectable({ providedIn: 'root' })
export class AdminAttendanceApi {
  private readonly api = inject(ApiClient);

  private offer(offerId: Uuid, rest: string): string {
    return `/api/v1/admin/offers/${encodeURIComponent(offerId)}/attendance${rest}`;
  }

  private session(sessionId: Uuid, rest = ''): string {
    return `/api/v1/admin/sessions/${encodeURIComponent(sessionId)}/attendance${rest}`;
  }

  /** Sesiones con el estado de su registro y "18 de 25 (72%)". */
  chips(offerId: Uuid) {
    return this.api.get<ApiResponse<'AdminAttendance_chips'>>(this.offer(offerId, '/sessions'));
  }

  /** % de asistencia de cada inscrito (sobre las sesiones ya realizadas). */
  participants(offerId: Uuid, query: ParticipantAttendanceQuery = {}) {
    return this.api.get<ApiResponse<'AdminAttendance_participants'>>(
      this.offer(offerId, '/participants'),
      { query: { ...query } },
    );
  }

  exportParticipants(offerId: Uuid, query: ParticipantAttendanceQuery = {}) {
    return this.api.getFile(this.offer(offerId, '/export'), 'asistencia.csv', {
      query: { ...query },
    });
  }

  /** Cada inscrito con su estado en la sesión, más el resumen (sin filtros). */
  sessionAttendance(sessionId: Uuid, query: SessionAttendanceQuery = {}) {
    return this.api.get<ApiResponse<'AdminAttendance_session'>>(this.session(sessionId), {
      query: { ...query },
    });
  }

  exportSession(sessionId: Uuid, query: SessionAttendanceQuery = {}) {
    return this.api.getFile(this.session(sessionId, '/export'), 'asistencia-sesion.csv', {
      query: { ...query },
    });
  }

  /** Marca a 1–200 personas con motivo (las ya registradas se omiten). */
  mark(sessionId: Uuid, body: ApiBody<'AdminAttendance_mark'>) {
    return this.api.post<ApiResponse<'AdminAttendance_mark'>>(
      this.session(sessionId, '/mark'),
      body,
    );
  }

  /** Borra el registro con motivo (queda en la auditoría). */
  unmark(sessionId: Uuid, body: ApiBody<'AdminAttendance_unmark'>) {
    return this.api.post<ApiResponse<'AdminAttendance_unmark'>>(
      this.session(sessionId, '/unmark'),
      body,
    );
  }

  /** Avisa a quienes no han registrado (solo con el registro abierto; uno por día). */
  remind(sessionId: Uuid) {
    return this.api.post<ApiResponse<'AdminAttendance_remind'>>(this.session(sessionId, '/remind'));
  }
}
