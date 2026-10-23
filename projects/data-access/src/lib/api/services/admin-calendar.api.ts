import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import { Uuid } from '../models.generated';
import { ApiBody, ApiQuery, ApiResponse } from '../operations.generated';

export type AdminCalendarQuery = ApiQuery<'AdminCalendar_view'>;
export type AdminCalendarEventsQuery = ApiQuery<'AdminCalendar_list'>;

/**
 * Calendario del panel (HU-29 / HU-10): sesiones de todas las ofertas y
 * eventos (manuales y fechas importantes). Ver: `offers.read`; cambiar
 * eventos: `offers.write`.
 */
@Injectable({ providedIn: 'root' })
export class AdminCalendarApi {
  private readonly api = inject(ApiClient);

  private event(id: Uuid, rest = ''): string {
    return `/api/v1/admin/calendar-events/${encodeURIComponent(id)}${rest}`;
  }

  /** Sesiones y eventos de un rango (máx. 62 días; `to` exclusivo). */
  view(query: AdminCalendarQuery) {
    return this.api.get<ApiResponse<'AdminCalendar_view'>>('/api/v1/admin/calendar', {
      query: { ...query },
    });
  }

  /** Eventos manuales y fechas importantes, paginados. */
  events(query: AdminCalendarEventsQuery = {}) {
    return this.api.get<ApiResponse<'AdminCalendar_list'>>('/api/v1/admin/calendar-events', {
      query: { ...query },
    });
  }

  /** Evento manual: solo lo ve la audiencia elegida; no notifica. */
  createEvent(body: ApiBody<'AdminCalendar_create'>) {
    return this.api.post<ApiResponse<'AdminCalendar_create'>>(
      '/api/v1/admin/calendar-events',
      body,
    );
  }

  /** `null` quita un valor opcional. */
  updateEvent(id: Uuid, body: ApiBody<'AdminCalendar_update'>) {
    return this.api.patch<ApiResponse<'AdminCalendar_update'>>(this.event(id), body);
  }

  removeEvent(id: Uuid) {
    return this.api.delete<ApiResponse<'AdminCalendar_remove'>>(this.event(id));
  }

  /** Sigue visible como "Cancelado", sin enlace. */
  cancelEvent(id: Uuid) {
    return this.api.post<ApiResponse<'AdminCalendar_cancel'>>(this.event(id, '/cancel'));
  }
}
