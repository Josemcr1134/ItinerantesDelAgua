import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import { silentRequest } from '../http-context';
import { Uuid } from '../models.generated';
import { ApiQuery, ApiResponse } from '../operations.generated';

/** Notificaciones del usuario. */
@Injectable({ providedIn: 'root' })
export class NotificationsApi {
  private readonly api = inject(ApiClient);

  /** `silent`: panel de la campana, sin el loader general. */
  list(query: ApiQuery<'Notifications_list'> = {}, options: { silent?: boolean } = {}) {
    return this.api.get<ApiResponse<'Notifications_list'>>('/api/v1/me/notifications', {
      query: { ...query },
      ...(options.silent ? { context: silentRequest() } : {}),
    });
  }

  /** Contador de no leídas (consulta periódica: sin loader general). */
  unreadCount() {
    return this.api.get<ApiResponse<'Notifications_unreadCount'>>(
      '/api/v1/me/notifications/unread-count',
      { context: silentRequest() },
    );
  }

  markAllRead() {
    return this.api.post<ApiResponse<'Notifications_markAllRead'>>(
      '/api/v1/me/notifications/read-all',
    );
  }

  markRead(id: Uuid) {
    return this.api.post<ApiResponse<'Notifications_markRead'>>(
      `/api/v1/me/notifications/${encodeURIComponent(id)}/read`,
    );
  }
}
