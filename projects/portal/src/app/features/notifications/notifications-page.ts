import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { SessionStore } from 'auth';
import { ApiResponse, NotificationDto, NotificationsApi, toApiError } from 'data-access';
import { AlertService } from 'ui-kit';
import { NotificationCenter } from '../../core/notifications/notification-center';
import { usePageHeading } from '../../core/page-heading/page-heading';
import { browserTimezone } from '../dashboard/dashboard-format';
import { categoryOfSlug, groupByDay, NOTIFICATION_CATEGORIES } from './notification-format';
import { NotificationItem } from './notification-item/notification-item';
import { notificationOpener } from './open-notification';

const PAGE_SIZE = 20;

type NotificationPage = ApiResponse<'Notifications_list'>;

/**
 * Notificaciones (HU-13; sin Figma, con la línea gráfica del portal):
 * resumen con ilustración, filtros por grupo (`?categoria=`) y sin leer
 * (`?estado=no-leidas`), y la lista por día con las fijadas primero.
 */
@Component({
  selector: 'portal-notifications-page',
  imports: [RouterLink, NotificationItem],
  templateUrl: './notifications-page.html',
  styleUrls: ['./notifications-page.scss', './notifications-list.scss'],
})
export default class NotificationsPage {
  private readonly api = inject(NotificationsApi);
  private readonly alerts = inject(AlertService);
  protected readonly center = inject(NotificationCenter);
  private readonly user = inject(SessionStore).user;
  protected readonly openAction = notificationOpener();

  /** Grupo (`?categoria=formacion|postulaciones|pagos|general`). */
  readonly categoria = input<string>();
  /** `?estado=no-leidas`: solo las no leídas. */
  readonly estado = input<string>();

  protected readonly categories = NOTIFICATION_CATEGORIES;
  protected readonly timezone = computed(() => this.user()?.timezone ?? browserTimezone());
  protected readonly category = computed(() => categoryOfSlug(this.categoria()));
  protected readonly unreadOnly = computed(() => this.estado() === 'no-leidas');
  protected readonly categoryLabel = computed(
    () => this.categories.find((c) => c.value === this.category())?.label ?? null,
  );

  /** Página pedida; vuelve a 1 al cambiar de filtro. */
  private readonly page = linkedSignal({
    source: () => [this.category(), this.unreadOnly()],
    computation: () => 1,
  });
  protected readonly list = rxResource({
    params: () => ({
      page: this.page(),
      pageSize: PAGE_SIZE,
      ...(this.category() ? { category: this.category() } : {}),
      ...(this.unreadOnly() ? { unread: true } : {}),
    }),
    stream: ({ params }) => this.api.list(params),
  });
  private readonly response = computed(() =>
    this.list.hasValue() ? this.list.value() : undefined,
  );
  /** Lo cargado hasta ahora ("Cargar más" suma la página siguiente). */
  protected readonly items = linkedSignal<NotificationPage | undefined, readonly NotificationDto[]>(
    {
      source: this.response,
      computation: (response, previous) => {
        if (!response) return previous?.value ?? [];
        if (response.meta.page === 1) return response.data;
        const seen = new Set(previous?.value.map((n) => n.id));
        return [...(previous?.value ?? []), ...response.data.filter((n) => !seen.has(n.id))];
      },
    },
  );
  protected readonly groups = computed(() => groupByDay(this.items(), this.timezone()));
  protected readonly hasMore = computed(
    () => this.items().length < (this.response()?.meta.total ?? 0),
  );
  protected readonly error = computed(() => {
    const error = this.list.error();
    return error ? toApiError(error).message : null;
  });
  protected readonly markingAll = signal(false);

  constructor() {
    usePageHeading().set({ title: 'Notificaciones' });
    this.center.refresh();
  }

  protected loadMore(): void {
    this.page.update((page) => page + 1);
  }

  protected async open(notification: NotificationDto): Promise<void> {
    this.markLocally(notification.id);
    await this.openAction(notification);
  }

  protected async markRead(notification: NotificationDto): Promise<void> {
    try {
      await this.center.markRead(notification);
      this.markLocally(notification.id);
    } catch (error) {
      await this.alerts.error('No se pudo marcar como leída', toApiError(error).message);
    }
  }

  protected async markAllRead(): Promise<void> {
    this.markingAll.set(true);
    try {
      await this.center.markAllRead();
      // Las fijadas siguen arriba: se vuelve a pedir la lista desde el inicio.
      if (this.page() === 1) this.list.reload();
      else this.page.set(1);
    } catch (error) {
      await this.alerts.error('No se pudieron marcar como leídas', toApiError(error).message);
    } finally {
      this.markingAll.set(false);
    }
  }

  private markLocally(id: string): void {
    const now = new Date().toISOString();
    this.items.update((items) =>
      items.map((n) => (n.id === id && !n.read ? { ...n, read: true, readAt: now } : n)),
    );
  }
}
