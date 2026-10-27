import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardPaymentsDto, PaymentAlertDto } from 'data-access';
import { dateIn, formatMoney } from '../../../shared/applications/application-format';
import { ALERT_LABELS } from '../../payments/payment-texts';

// TODO(contenido): confirmar los textos de los avisos de pago del dashboard.
const TEXT = {
  label: 'Avisos de pago',
  resolve: 'Resolver en Mis pagos',
  upload: 'Subir otro comprobante',
  view: 'Ver Mis pagos',
  upcoming: (amount: string, date: string, card: string | null) =>
    `Próximo cobro automático: ${amount} el ${date}${card ? ` con ${card}` : ''}.`,
};

/**
 * Avisos de pago del dashboard (HU-06 / HU-26): banner destacado si hay un
 * cobro fallido, mora o un comprobante rechazado (→ Mis pagos), y el aviso
 * informativo de las cuotas que se cobran en los próximos 7 días.
 */
@Component({
  selector: 'portal-payment-notices',
  imports: [RouterLink],
  template: `
    @if (alerts().length || upcoming().length) {
      <section class="notices" [attr.aria-label]="t.label">
        @for (alert of alerts(); track $index) {
          <p class="notice" [attr.data-type]="alert.type" role="status">
            <span class="notice__text">
              <strong>{{ labels[alert.type] }}:</strong>
              {{ alert.offer.name }} · {{ money(alert.amount) }}
              @if (alert.date) {
                · {{ date(alert.date) }}
              }
            </span>
            @if (alert.type === 'TRANSFER_REJECTED' && alert.applicationId) {
              <a
                class="notice__action"
                routerLink="/pago"
                [queryParams]="{ postulacion: alert.applicationId }"
              >
                {{ t.upload }}
              </a>
            } @else {
              <a class="notice__action" routerLink="/perfil" [queryParams]="{ pestana: 'pagos' }">
                {{ alert.type === 'TRANSFER_PENDING' ? t.view : t.resolve }}
              </a>
            }
          </p>
        }
        @for (item of upcoming(); track $index) {
          <p class="notice notice--info">
            <span class="notice__text">{{ upcomingText(item) }}</span>
            <a class="notice__action" routerLink="/perfil" [queryParams]="{ pestana: 'pagos' }">
              {{ t.view }}
            </a>
          </p>
        }
      </section>
    }
  `,
  styleUrl: './payment-notices.scss',
})
export class PaymentNotices {
  readonly payments = input.required<DashboardPaymentsDto | null>();
  readonly timezone = input.required<string>();

  protected readonly t = TEXT;
  protected readonly labels = ALERT_LABELS;
  protected readonly money = formatMoney;
  protected readonly alerts = computed(() => this.payments()?.alerts ?? []);
  protected readonly upcoming = computed(() => this.payments()?.upcomingInstallments ?? []);

  protected date(iso: string): string {
    return dateIn(iso, this.timezone());
  }

  protected upcomingText(item: PaymentAlertDto): string {
    const card = item.card?.last4
      ? `${item.card.brand ?? 'tu tarjeta'} •••• ${item.card.last4}`
      : null;
    return TEXT.upcoming(this.money(item.amount), item.date ? this.date(item.date) : '—', card);
  }
}
