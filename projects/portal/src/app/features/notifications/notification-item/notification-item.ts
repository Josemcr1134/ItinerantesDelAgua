import { Component, computed, input, output } from '@angular/core';
import { NotificationDto } from 'data-access';
import { timeIn } from '../../calendar/calendar-time';
import { NOTIFICATION_CATEGORIES, relativeTime } from '../notification-format';
import { NotificationIcon } from '../notification-icon';

/**
 * Una notificación (HU-13): ícono del grupo, título, texto, cuándo llegó y su
 * acción. Sin leer: punto dorado y título en negrita; fijada: "Importante".
 */
@Component({
  selector: 'portal-notification-item',
  imports: [NotificationIcon],
  template: `
    @let n = notification();
    <article
      class="item"
      [class.item--unread]="!n.read"
      [class.item--pinned]="n.pinned"
      [class.item--compact]="compact()"
      [attr.aria-labelledby]="'notification-' + n.id"
    >
      <span class="item__icon" [attr.data-category]="n.category">
        <portal-notification-icon [category]="n.category" />
      </span>
      <div class="item__body">
        <p class="item__meta">
          @if (!compact()) {
            <span>{{ category() }}</span>
          }
          @if (n.pinned) {
            <span class="item__flag">Importante</span>
          }
          <time class="item__time" [attr.datetime]="n.createdAt">{{ when() }}</time>
        </p>
        <h3 class="item__title" [id]="'notification-' + n.id">
          @if (!n.read) {
            <span class="visually-hidden">Sin leer: </span>
          }
          {{ n.title }}
        </h3>
        <p class="item__text">{{ n.body }}</p>
        @if (n.action || !n.read) {
          <div class="item__actions">
            @if (n.action; as action) {
              <button type="button" class="item__action" (click)="opened.emit(n)">
                {{ action.label }}
                <span aria-hidden="true">→</span>
              </button>
            }
            @if (!n.read) {
              <button type="button" class="item__mark" (click)="markRead.emit(n)">
                Marcar como leída
              </button>
            }
          </div>
        }
      </div>
      @if (!n.read) {
        <span class="item__dot" aria-hidden="true"></span>
      }
    </article>
  `,
  styleUrl: './notification-item.scss',
})
export class NotificationItem {
  readonly notification = input.required<NotificationDto>();
  readonly timezone = input.required<string>();
  /** Panel de la campana: sin el nombre del grupo y con el texto recortado. */
  readonly compact = input(false);
  /** Solo la hora (la lista ya la agrupa por día). */
  readonly timeOnly = input(false);
  readonly opened = output<NotificationDto>();
  readonly markRead = output<NotificationDto>();

  protected readonly category = computed(
    () => NOTIFICATION_CATEGORIES.find((c) => c.value === this.notification().category)?.label,
  );
  protected readonly when = computed(() => {
    const createdAt = this.notification().createdAt;
    return this.timeOnly()
      ? timeIn(createdAt, this.timezone())
      : relativeTime(createdAt, this.timezone());
  });
}
