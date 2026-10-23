import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminPaymentDetailDto, AdminPaymentsApi, requestState } from 'data-access';
import { firstValueFrom } from 'rxjs';
import { Button } from 'ui-kit';
import { AdminAccess } from '../../../core/access/admin-access';
import { ErrorPresenter } from '../../../core/error-presenter';
import { formatDateTime, formatMoney } from '../../../shared/format/format';
import { Notice } from '../../../shared/notice/notice';
import { RequestState } from '../../../shared/request-state/request-state';
import { formatBytes } from '../../offers/content/content-labels';
import { formatOfferDate } from '../../offers/shared/zoned-time';
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONES,
  REFUND_STATUS_LABELS,
  REFUND_STATUS_TONES,
  REJECTION_REASON_LABELS,
  formatCard,
} from '../payment-labels';
import { RefundDialog } from './refund-dialog';
import { TransferReview, TransferReviewDialog } from './transfer-review-dialog';

/**
 * Detalle de un pago (HU-33): concepto, quién paga, IDs de Stripe,
 * transferencia (esperado vs. declarado y comprobante) y reembolsos. Las
 * acciones (validar/rechazar, reembolsar) dependen de `actions`.
 */
@Component({
  selector: 'adm-payment-detail-page',
  imports: [RouterLink, Button, Notice, RequestState, RefundDialog, TransferReviewDialog],
  templateUrl: './payment-detail-page.html',
  styleUrl: '../detail.scss',
})
export default class PaymentDetailPage {
  /** `/pagos/:id`. */
  readonly id = input.required<string>();

  private readonly api = inject(AdminPaymentsApi);
  private readonly errors = inject(ErrorPresenter);
  private readonly access = inject(AdminAccess);

  protected readonly payment = requestState<AdminPaymentDetailDto>();
  protected readonly notice = signal('');
  protected readonly canReadApplications = computed(() => this.access.can('applications.read'));

  protected readonly statusLabels = PAYMENT_STATUS_LABELS;
  protected readonly statusTones = PAYMENT_STATUS_TONES;
  protected readonly methodLabels = PAYMENT_METHOD_LABELS;
  protected readonly refundLabels = REFUND_STATUS_LABELS;
  protected readonly refundTones = REFUND_STATUS_TONES;
  protected readonly rejectionLabels = REJECTION_REASON_LABELS;
  protected readonly money = formatMoney;
  protected readonly card = formatCard;
  protected readonly formatDateTime = formatDateTime;
  protected readonly formatDate = formatOfferDate;
  protected readonly formatBytes = formatBytes;

  protected readonly refunding = signal(false);
  protected readonly reviewing = signal(false);
  protected readonly reviewMode = signal<TransferReview>('validate');
  protected readonly openingProof = signal(false);

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => void this.payment.run(this.api.detail(id)));
    });
  }

  protected reload(): void {
    void this.payment.run(this.api.detail(this.id()));
  }

  protected review(mode: TransferReview): void {
    this.reviewMode.set(mode);
    this.reviewing.set(true);
  }

  protected onReviewed({
    payment,
    mode,
  }: {
    payment: AdminPaymentDetailDto;
    mode: TransferReview;
  }) {
    this.payment.set(payment);
    this.notice.set(
      mode === 'validate'
        ? `Se validó la transferencia de ${payment.payer.fullName}: su inscripción quedó activa y se le avisó.`
        : `Se rechazó la transferencia de ${payment.payer.fullName} y se le avisó el motivo.`,
    );
  }

  protected onRefunded(payment: AdminPaymentDetailDto): void {
    this.payment.set(payment);
    const last = payment.refunds[0];
    this.notice.set(
      last?.status === 'PENDING'
        ? 'Se pidió el reembolso a Stripe; queda «en proceso» hasta que se confirme.'
        : last?.status === 'FAILED'
          ? `El reembolso falló: ${last.failureMessage ?? 'Stripe lo rechazó.'}`
          : 'Se registró el reembolso.',
    );
  }

  /**
   * Abre el comprobante (URL firmada de ~10 min). La pestaña se abre al hacer
   * clic para que el navegador no la bloquee y se lleva a la URL al llegar.
   */
  protected async openProof(): Promise<void> {
    const tab = window.open('', '_blank');
    this.openingProof.set(true);
    try {
      const access = await firstValueFrom(this.api.proof(this.id()));
      if (tab) {
        tab.opener = null;
        tab.location.href = access.url;
      } else {
        window.open(access.url, '_blank', 'noopener');
      }
    } catch (error) {
      tab?.close();
      void this.errors.present(error, { title: 'No se pudo abrir el comprobante' });
    } finally {
      this.openingProof.set(false);
    }
  }
}
