import { Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { SessionStore } from 'auth';
import { PaymentDto, PaymentPlanDto, PaymentsApi, toApiError } from 'data-access';
import { firstValueFrom, map } from 'rxjs';
import { AlertService } from 'ui-kit';
import { dateIn, formatMoney } from '../../../shared/applications/application-format';
import { ExternalNavigation } from '../../../shared/external-navigation';
import { tabOpener } from '../../../shared/open-in-tab';
import { browserTimezone } from '../../dashboard/dashboard-format';
import {
  ALERT_LABELS,
  INSTALLMENT_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TEXTS,
  paymentErrorMessage,
  PLAN_STATUS_LABELS,
} from '../payment-texts';

/**
 * Mis pagos (HU-26 / HU-24): avisos (cobro fallido, mora, transferencias),
 * planes de cuotas con su calendario y acciones (actualizar tarjeta, pagar
 * ahora) y el historial con comprobantes.
 */
@Component({
  selector: 'portal-my-payments',
  imports: [RouterLink],
  templateUrl: './my-payments.html',
  styleUrls: ['./my-payments.scss', './my-payments-history.scss'],
})
export class MyPayments {
  private readonly api = inject(PaymentsApi);
  private readonly alerts = inject(AlertService);
  private readonly external = inject(ExternalNavigation);
  private readonly openTab = tabOpener();
  private readonly user = inject(SessionStore).user;

  /** Al volver de actualizar la tarjeta en Stripe (`?cardUpdate=success|cancel`). */
  readonly cardUpdate = input<string>();

  protected readonly t = PAYMENT_TEXTS.mine;
  protected readonly statuses = PAYMENT_STATUS_LABELS;
  protected readonly planStatuses = PLAN_STATUS_LABELS;
  protected readonly installmentStatuses = INSTALLMENT_STATUS_LABELS;
  protected readonly alertLabels = ALERT_LABELS;
  protected readonly money = formatMoney;
  private readonly timezone = computed(() => this.user()?.timezone ?? browserTimezone());

  protected readonly summary = rxResource({ stream: () => this.api.summary() });
  protected readonly plans = rxResource({
    stream: () => this.api.plans().pipe(map((r) => r.data)),
    defaultValue: [],
  });
  protected readonly history = rxResource({
    stream: () => this.api.list({ pageSize: 50 }).pipe(map((r) => r.data)),
    defaultValue: [],
  });
  protected readonly busy = signal<string | null>(null);

  protected readonly error = computed(() => {
    const error = this.summary.error() ?? this.plans.error() ?? this.history.error();
    return error ? toApiError(error).message : null;
  });
  protected readonly notice = computed(() => {
    const result = this.cardUpdate();
    return result === 'success'
      ? this.t.cardUpdated
      : result === 'cancel'
        ? this.t.cardUpdateCancelled
        : null;
  });
  protected readonly summaryValue = computed(() =>
    this.summary.hasValue() ? this.summary.value() : undefined,
  );
  protected readonly empty = computed(
    () =>
      this.summaryValue()?.hasPayments === false &&
      !this.plans.value().length &&
      !this.history.value().length,
  );

  protected date(iso: string | null): string {
    return iso ? dateIn(iso, this.timezone()) : '—';
  }

  protected card(plan: Pick<PaymentPlanDto, 'card'>): string | null {
    const card = plan.card;
    return card?.last4 ? this.t.card(card.brand ?? 'Tarjeta', card.last4) : null;
  }

  /** [Actualizar tarjeta]: checkout de Stripe en modo `setup`. */
  protected async updateCard(planId: string): Promise<void> {
    this.busy.set(planId);
    try {
      const session = await firstValueFrom(this.api.updateCard(planId));
      this.external.go(session.checkoutUrl);
    } catch (error) {
      this.busy.set(null);
      await this.alerts.error(
        'No se pudo abrir el cambio de tarjeta',
        paymentErrorMessage(toApiError(error)),
      );
    }
  }

  /** [Pagar ahora]: cobra las cuotas fallidas con la tarjeta registrada. */
  protected async payNow(planId: string): Promise<void> {
    this.busy.set(planId);
    try {
      await firstValueFrom(this.api.payNow(planId));
      await this.alerts.success(this.t.payNow, this.t.paidNow);
    } catch (error) {
      const apiError = toApiError(error);
      await this.alerts.error(
        'No se pudo cobrar',
        apiError.metaString('failureMessage') ?? paymentErrorMessage(apiError),
      );
    } finally {
      this.busy.set(null);
      this.reload();
    }
  }

  protected async receipt(payment: PaymentDto): Promise<void> {
    try {
      this.external.save(
        await firstValueFrom(this.api.receipt(payment.id, `comprobante-${payment.folio}.pdf`)),
      );
    } catch (error) {
      await this.alerts.error('No se pudo descargar el comprobante', toApiError(error).message);
    }
  }

  protected proof(payment: PaymentDto): Promise<void> {
    return this.openTab(this.api.transferProof(payment.id), 'No se pudo abrir el comprobante');
  }

  protected continueCheckout(payment: PaymentDto): void {
    if (payment.checkout?.url) this.external.go(payment.checkout.url);
  }

  private reload(): void {
    this.summary.reload();
    this.plans.reload();
    this.history.reload();
  }
}
