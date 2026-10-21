import { inject, Injectable } from '@angular/core';
import { ApiClient, PageQuery, Paginated } from '../api-client';
import {
  AttendanceResultDto,
  RegisterAttendanceRequestDto,
  SessionCardDto,
} from '../models.generated';

export interface SessionsQuery extends PageQuery {
  readonly scope?: 'UPCOMING' | 'PAST';
  readonly offerId?: string;
}

/** Sesiones en vivo y asistencia. */
@Injectable({ providedIn: 'root' })
export class SessionsApi {
  private readonly api = inject(ApiClient);

  list(query: SessionsQuery = {}) {
    return this.api.get<Paginated<SessionCardDto>>('/api/v1/me/sessions', { query: { ...query } });
  }

  byId(sessionId: string) {
    return this.api.get<SessionCardDto>(`/api/v1/me/sessions/${encodeURIComponent(sessionId)}`);
  }

  registerAttendance(sessionId: string, body: RegisterAttendanceRequestDto) {
    return this.api.post<AttendanceResultDto>(
      `/api/v1/me/sessions/${encodeURIComponent(sessionId)}/attendance`,
      body,
    );
  }
}
