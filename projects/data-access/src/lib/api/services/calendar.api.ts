import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import { CalendarResponseDto } from '../models.generated';

export type CalendarCategory =
  'TRAINING' | 'TERRITORY' | 'COMMUNITY' | 'EVENTS' | 'IMPORTANT_DATES';

export interface CalendarQuery {
  /** Inicio del rango (ISO 8601). */
  readonly from: string;
  /** Fin del rango (ISO 8601). */
  readonly to: string;
  readonly categories?: readonly CalendarCategory[];
}

/** Calendario del usuario. */
@Injectable({ providedIn: 'root' })
export class CalendarApi {
  private readonly api = inject(ApiClient);

  get(query: CalendarQuery) {
    return this.api.get<CalendarResponseDto>('/api/v1/me/calendar', { query: { ...query } });
  }
}
