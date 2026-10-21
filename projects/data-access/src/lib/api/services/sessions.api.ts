import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import { Uuid } from '../models.generated';
import { ApiBody, ApiQuery, ApiResponse } from '../operations.generated';

/** Sesiones en vivo y asistencia. */
@Injectable({ providedIn: 'root' })
export class SessionsApi {
  private readonly api = inject(ApiClient);

  list(query: ApiQuery<'LiveSessions_list'> = {}) {
    return this.api.get<ApiResponse<'LiveSessions_list'>>('/api/v1/me/sessions', {
      query: { ...query },
    });
  }

  byId(sessionId: Uuid) {
    return this.api.get<ApiResponse<'LiveSessions_detail'>>(
      `/api/v1/me/sessions/${encodeURIComponent(sessionId)}`,
    );
  }

  registerAttendance(sessionId: Uuid, body: ApiBody<'LiveSessions_registerAttendance'>) {
    return this.api.post<ApiResponse<'LiveSessions_registerAttendance'>>(
      `/api/v1/me/sessions/${encodeURIComponent(sessionId)}/attendance`,
      body,
    );
  }
}
