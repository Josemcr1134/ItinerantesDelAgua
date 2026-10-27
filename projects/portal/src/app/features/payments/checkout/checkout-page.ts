import { Component, computed, effect, inject, input, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { SessionStore } from 'auth';
import { PaymentDto, PaymentMethod, PaymentsApi, toApiError } from 'data-access';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { usePageHeading } from '../../../core/page-heading/page-heading';
import { dateIn, dateRange, formatMoney } from '../../../shared/applications/application-format';
import { ExternalNavigation } from '../../../shared/external-navigation';
import { browserTimezone } from '../../dashboard/dashboard-format';
import { BLOCKER_LABELS, PAYMENT_TEXTS } from '../payment-texts';
import { TransferForm } from './transfer-form';

/**
 * Pago (Fase 05, sin Figma; línea gráfica del portal):
 * - HU-22 / HU-24 (`?oferta=`): pago completo o en cuotas desde la ficha.
 * - HU-23 (`?postulacion=`): saldo tras beca, con tarjeta o (México) por
 *   transferencia con comprobante.
 * El monto, las cuotas y los métodos los calcula la API (`quote`); con
 * tarjeta se sigue en el checkout de Stripe.
 */
@Component({
  selector: 'portal-checkout-page',
  imports: [RouterLink, TransferForm],
  templateUrl: './checkout-page.html',
  styleUrls: ['./checkout-page.scss', './checkout-options.scss'],
})
export default class CheckoutPage {
  private readonly api = inject(PaymentsApi);
  private readonly external = inject(ExternalNavigation);
  private readonly heading = usePageHeading();
  private readonly user = inject(SessionStore).user;

  /** Oferta a pagar completa (`?oferta=`). */
  readonly oferta = input<string>();
  /** Postulación aprobada con saldo (`?postulacion=`). */
  readonly postulacion = input<string>();
  /** `?cuotas=1`: llega desde [Pagar en cuotas] (se preselecciona la primera opción). */
  readonly cuotas = input<string>();

  protected readonly t = PAYMENT_TEXTS;
  protected readonly money = formatMoney;
  private readonly timezone = computed(() => this.user()?.timezone ?? browserTimezone());

  protected readonly quote = rxResource({
    params: () => {
      const applicationId = this.postulacion();
      const offerId = this.oferta();
      return applicationId ? { applicationId } : offerId ? { offerId } : undefined;
    },
    stream: ({ params }) => this.api.quote(params),
  });
  protected readonly current = computed(() =>
    this.quote.hasValue() ? this.quote.value() : undefined,
  );
  protected readonly loadError = computed(() => {
    const error = this.quote.error();
    return error ? toApiError(error).message : null;
  });

  /** Cuotas elegidas (0 = pago único). */
  protected readonly count = linkedSignal(() => {
    const options = this.current()?.installments?.options.filter((o) => o.available) ?? [];
    return this.cuotas() && options.length ? options[0].count : 0;
  });
  protected readonly option = computed(
    () => this.current()?.installments?.options.find((o) => o.count === this.count()) ?? null,
  );
  /** Métodos que se muestran (la transferencia "Solo México" se oculta fuera de México). */
  protected readonly methods = computed(() =>
    (this.current()?.methods ?? []).filter(
      (m) => m.method === 'CARD' || (m.method === 'BANK_TRANSFER' && m.reason !== 'NOT_MEXICO'),
    ),
  );
  protected readonly method = linkedSignal<PaymentMethod>(() => {
    const latest = this.current()?.latestTransfer;
    return latest?.status === 'PENDING_VALIDATION' ? 'BANK_TRANSFER' : 'CARD';
  });
  protected readonly cardAvailable = computed(
    () => this.current()?.methods.find((m) => m.method === 'CARD')?.available ?? false,
  );

  protected readonly terms = signal(false);
  protected readonly autoDebit = signal(false);
  protected readonly paying = signal(false);
  protected readonly error = signal<string | null>(null);
  /** Comprobante recién enviado (sin volver a pedir el resumen). */
  protected readonly sentTransfer = signal<PaymentDto | null>(null);

  protected readonly blocker = computed(() => {
    const blocker = this.current()?.blocker;
    return blocker ? (BLOCKER_LABELS[blocker.code] ?? blocker.code) : null;
  });
  protected readonly dates = computed(() => {
    const offer = this.current()?.offer;
    return offer ? dateRange(offer.startsAt, offer.endsAt, this.timezone()) : null;
  });
  protected readonly dueAt = computed(() => {
    const due = this.current()?.application?.dueAt;
    return due ? dateIn(due, this.timezone()) : null;
  });
  protected readonly offerUrl = computed(() => {
    const slug = this.current()?.offer.slug;
    return slug ? new URL(`/escuela/oferta/${slug}`, environment.landingUrl).href : null;
  });
  /** Lo que se paga ahora: el total o la 1.ª cuota. */
  protected readonly payNowAmount = computed(() => {
    const option = this.option();
    if (option) return option.schedule[0]?.amount ?? option.perInstallment;
    return this.current()?.amount ?? null;
  });
  protected readonly canPay = computed(
    () =>
      !this.blocker() &&
      !!this.payNowAmount() &&
      this.cardAvailable() &&
      this.terms() &&
      (!this.option() || this.autoDebit()),
  );

  constructor() {
    effect(() => {
      this.heading.set({
        title: this.postulacion() ? this.t.titleBalance : this.t.titleOffer,
        ...(this.current() ? { subtitle: this.current()!.offer.name } : {}),
      });
    });
  }

  protected date(iso: string): string {
    return dateIn(iso, this.timezone());
  }

  /** Pago con tarjeta: crea (o reutiliza) el checkout de Stripe y va a él. */
  protected async payByCard(): Promise<void> {
    const quote = this.current();
    if (!quote || !this.canPay()) return;
    this.paying.set(true);
    this.error.set(null);
    const option = this.option();
    try {
      const session = await firstValueFrom(
        this.api.checkout({
          ...(quote.application
            ? { applicationId: quote.application.id }
            : { offerId: quote.offer.id }),
          termsAccepted: true,
          ...(option ? { installmentCount: option.count, autoDebitAuthorized: true } : {}),
        }),
      );
      this.external.go(session.checkoutUrl);
    } catch (error) {
      const apiError = toApiError(error);
      this.error.set(
        apiError.code === 'PAYMENTS_NOT_CONFIGURED' ? this.t.notConfigured : apiError.message,
      );
      this.paying.set(false);
    }
  }

  protected continueCheckout(payment: PaymentDto): void {
    if (payment.checkout?.url) this.external.go(payment.checkout.url);
  }

  /** Cierra el checkout abierto (libera el cupo) para elegir otra opción. */
  protected async cancelCheckout(payment: PaymentDto): Promise<void> {
    try {
      await firstValueFrom(this.api.cancel(payment.id));
    } finally {
      this.quote.reload();
    }
  }

  protected onTransferSent(payment: PaymentDto): void {
    this.sentTransfer.set(payment);
  }
}
