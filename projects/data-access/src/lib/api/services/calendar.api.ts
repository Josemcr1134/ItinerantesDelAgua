import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import { ApiQuery, ApiResponse } from '../operations.generated';

/** Calendario del usuario. */
@Injectable({ providedIn: 'root' })
export class CalendarApi {
  private readonly api = inject(ApiClient);

  /** Eventos entre `from` y `to` (ISO 8601). */
  get(query: ApiQuery<'Calendar_get'>) {
    return this.api.get<ApiResponse<'Calendar_get'>>('/api/v1/me/calendar', {
      query: { ...query },
    });
  }
}
