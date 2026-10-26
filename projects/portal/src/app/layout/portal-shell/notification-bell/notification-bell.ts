import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { NotificationDto, NotificationsApi } from 'data-access';
import { filter, map } from 'rxjs';
import { NotificationCenter } from '../../../core/notifications/notification-center';
import { NotificationItem } from '../../../features/notifications/notification-item/notification-item';
import { notificationOpener } from '../../../features/notifications/open-notification';

/** Notificaciones del panel (las más recientes; fijadas primero). */
const PANEL_SIZE = 5;

/**
 * Campana del encabezado (HU-13): contador de no leídas y, al abrirla, las
 * últimas notificaciones con "Marcar todas como leídas" y "Ver todas".
 */
@Component({
  selector: 'portal-notification-bell',
  imports: [RouterLink, NotificationItem],
  templateUrl: './notification-bell.html',
  styleUrl: './notification-bell.scss',
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'close()',
  },
})
export class NotificationBell {
  private readonly api = inject(NotificationsApi);
  protected readonly center = inject(NotificationCenter);
  private readonly openAction = notificationOpener();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly timezone = input.required<string>();

  protected readonly open = signal(false);
  protected readonly unread = this.center.unread;
  protected readonly badge = computed(() => (this.unread() > 99 ? '99+' : String(this.unread())));
  protected readonly label = computed(() =>
    this.unread() ? `Notificaciones, ${this.unread()} sin leer` : 'Notificaciones',
  );

  private readonly latest = rxResource({
    params: () => (this.open() ? { pageSize: PANEL_SIZE } : undefined),
    stream: ({ params }) =>
      this.api.list(params, { silent: true }).pipe(map((response) => response.data)),
  });
  protected readonly loaded = computed(() => this.latest.hasValue());
  protected readonly failed = computed(() => !!this.latest.error());
  /** Copia local para marcar como leídas sin volver a pedirlas. */
  protected readonly items = linkedSignal<readonly NotificationDto[]>(() =>
    this.latest.hasValue() ? this.latest.value() : [],
  );

  constructor() {
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.open.set(false));
  }

  protected toggle(): void {
    this.open.update((open) => !open);
    if (this.open()) this.center.refresh();
  }

  protected close(): void {
    this.open.set(false);
  }

  /** Clic fuera de la campana y su panel: se cierra. */
  protected onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node | null;
    if (this.open() && target?.isConnected && !this.host.nativeElement.contains(target)) {
      this.close();
    }
  }

  protected async openItem(notification: NotificationDto): Promise<void> {
    this.markLocally(notification.id);
    this.close();
    await this.openAction(notification);
  }

  protected async markRead(notification: NotificationDto): Promise<void> {
    try {
      await this.center.markRead(notification);
      this.markLocally(notification.id);
    } catch {
      // Se reintenta desde la página de notificaciones.
    }
  }

  protected async markAllRead(): Promise<void> {
    try {
      await this.center.markAllRead();
      this.items.update((items) => items.map((n) => ({ ...n, read: true })));
    } catch {
      // El contador sigue igual: la persona puede volver a intentarlo.
    }
  }

  private markLocally(id: string): void {
    this.items.update((items) => items.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }
}
