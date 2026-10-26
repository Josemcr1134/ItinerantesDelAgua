import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationDto, NotificationsApi } from 'data-access';
import { filter, firstValueFrom, interval } from 'rxjs';

/** Cada cuánto se vuelve a pedir el contador (HU-13: "cada minuto"). */
export const UNREAD_POLL_MS = 60_000;

/**
 * Contador de la campana (HU-13): no leídas y fijadas. Se pide al navegar y
 * cada minuto mientras la pestaña está visible; marcar como leída lo ajusta
 * sin esperar a la siguiente consulta.
 */
@Injectable({ providedIn: 'root' })
export class NotificationCenter {
  private readonly api = inject(NotificationsApi);

  readonly unread = signal(0);
  readonly pinned = signal(0);
  /** Cambia al marcar como leídas (para que las listas abiertas se actualicen). */
  readonly version = signal(0);

  /** Consulta periódica mientras viva el marco (contexto de inyección). */
  startPolling(): void {
    interval(UNREAD_POLL_MS)
      .pipe(
        filter(() => typeof document === 'undefined' || document.visibilityState === 'visible'),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(() => this.refresh());
  }

  refresh(): void {
    this.api.unreadCount().subscribe({
      next: (count) => {
        this.unread.set(count.unread);
        this.pinned.set(count.pinned);
      },
      // Sin contador no se interrumpe nada: se reintenta en la próxima consulta.
      error: () => undefined,
    });
  }

  /** Marca una como leída (si no lo estaba) y descuenta del contador. */
  async markRead(notification: NotificationDto): Promise<NotificationDto> {
    if (notification.read) return notification;
    const updated = await firstValueFrom(this.api.markRead(notification.id));
    this.unread.update((n) => Math.max(0, n - 1));
    this.version.update((v) => v + 1);
    return updated;
  }

  async markAllRead(): Promise<number> {
    const { updated } = await firstValueFrom(this.api.markAllRead());
    this.unread.set(0);
    this.version.update((v) => v + 1);
    // Las fijadas siguen fijadas hasta regularizar: el contador real lo dice la API.
    this.refresh();
    return updated;
  }
}
