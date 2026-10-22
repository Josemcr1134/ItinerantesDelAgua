import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import { Uuid } from '../models.generated';
import { ApiBody, ApiResponse } from '../operations.generated';

/** Sesiones (videoconferencias) de una oferta (HU-29). Ver: `offers.read`; cambiar: `offers.write`. */
@Injectable({ providedIn: 'root' })
export class AdminSessionsApi {
  private readonly api = inject(ApiClient);

  private offer(offerId: Uuid, rest = ''): string {
    return `/api/v1/admin/offers/${encodeURIComponent(offerId)}/sessions${rest}`;
  }

  private session(id: Uuid, rest = ''): string {
    return `/api/v1/admin/sessions/${encodeURIComponent(id)}${rest}`;
  }

  /** Todas, también las canceladas, en orden; con enlace de anfitrión. */
  list(offerId: Uuid) {
    return this.api.get<ApiResponse<'AdminSessions_list'>>(this.offer(offerId));
  }

  /** Sesión suelta, fuera de la regla. */
  create(offerId: Uuid, body: ApiBody<'AdminSessions_create'>) {
    return this.api.post<ApiResponse<'AdminSessions_create'>>(this.offer(offerId), body);
  }

  /** Calcula las sesiones de la regla sin guardar nada. */
  preview(offerId: Uuid, body: ApiBody<'AdminSessions_preview'>) {
    return this.api.post<ApiResponse<'AdminSessions_preview'>>(
      this.offer(offerId, '/preview'),
      body,
    );
  }

  /** Crea todas las sesiones de la vista previa (nunca parcial). */
  generate(offerId: Uuid, body: ApiBody<'AdminSessions_generate'>) {
    return this.api.post<ApiResponse<'AdminSessions_generate'>>(
      this.offer(offerId, '/generate'),
      body,
    );
  }

  get(id: Uuid) {
    return this.api.get<ApiResponse<'AdminSessions_get'>>(this.session(id));
  }

  /** Enlaces, módulo, categoría, ventana o grabación (no el horario). */
  update(id: Uuid, body: ApiBody<'AdminSessions_update'>) {
    return this.api.patch<ApiResponse<'AdminSessions_update'>>(this.session(id), body);
  }

  /** Solo sin registros de asistencia (si no, se cancela). No avisa a nadie. */
  remove(id: Uuid) {
    return this.api.delete<ApiResponse<'AdminSessions_remove'>>(this.session(id));
  }

  /** Cambia el horario de esa sesión y avisa a los inscritos. */
  reschedule(id: Uuid, body: ApiBody<'AdminSessions_reschedule'>) {
    return this.api.post<ApiResponse<'AdminSessions_reschedule'>>(
      this.session(id, '/reschedule'),
      body,
    );
  }

  /** La deja "Cancelada" y avisa a los inscritos. */
  cancel(id: Uuid, body: ApiBody<'AdminSessions_cancel'>) {
    return this.api.post<ApiResponse<'AdminSessions_cancel'>>(this.session(id, '/cancel'), body);
  }
}
