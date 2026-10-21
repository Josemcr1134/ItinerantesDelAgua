import { inject, Injectable } from '@angular/core';
import { ApiClient, PageQuery, Paginated } from '../api-client';
import { silentRequest } from '../http-context';
import { MarkAllReadResponseDto, NotificationDto, UnreadCountDto } from '../models.generated';

export interface NotificationsQuery extends PageQuery {
  readonly unread?: boolean;
  readonly category?: 'TRAINING' | 'APPLICATIONS' | 'PAYMENTS' | 'GENERAL';
}

/** Notificaciones del usuario. */
@Injectable({ providedIn: 'root' })
export class NotificationsApi {
  private readonly api = inject(ApiClient);

  list(query: NotificationsQuery = {}) {
    return this.api.get<Paginated<NotificationDto>>('/api/v1/me/notifications', {
      query: { ...query },
    });
  }

  /** Contador de no leídas (consulta periódica: sin loader general). */
  unreadCount() {
    return this.api.get<UnreadCountDto>('/api/v1/me/notifications/unread-count', {
      context: silentRequest(),
    });
  }

  markAllRead() {
    return this.api.post<MarkAllReadResponseDto>('/api/v1/me/notifications/read-all');
  }

  markRead(id: string) {
    return this.api.post<NotificationDto>(
      `/api/v1/me/notifications/${encodeURIComponent(id)}/read`,
    );
  }
}
