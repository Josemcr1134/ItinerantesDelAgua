import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationDto } from 'data-access';
import { NotificationCenter } from '../../core/notifications/notification-center';
import { notificationTarget } from './notification-format';

/**
 * Abre la acción de una notificación (y la marca como leída). Si marcarla
 * falla, igual se navega: no es motivo para frenar a la persona. Llamar en un
 * contexto de inyección.
 */
export function notificationOpener(): (notification: NotificationDto) => Promise<void> {
  const center = inject(NotificationCenter);
  const router = inject(Router);
  return async (notification) => {
    if (!notification.action) return;
    const target = notificationTarget(notification.action.path);
    // La pestaña se abre antes de esperar a la API para que el navegador no la bloquee.
    if ('external' in target) window.open(target.external, '_blank', 'noopener');
    await center.markRead(notification).catch(() => notification);
    if ('url' in target) await router.navigateByUrl(target.url);
  };
}
