import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AdminPaymentDetailDto,
  AdminPaymentsApi,
  TRANSFER_REJECTION_REASON_VALUES,
  TransferRejectionReason,
  toApiError,
} from 'data-access';
import { firstValueFrom } from 'rxjs';
import { Dialog, DialogActions } from 'ui-kit';
import { ErrorPresenter } from '../../../core/error-presenter';
import { FormActions } from '../../../shared/form-actions/form-actions';
import { formatMoney } from '../../../shared/format/format';
import { isoToZonedInput } from '../../offers/shared/zoned-time';
import { REJECTION_REASON_LABELS } from '../payment-labels';

export type TransferReview = 'validate' | 'reject';

/**
 * Validar una transferencia (monto y fecha recibidos: con el saldo completo
 * se activa la inscripción) o rechazarla con motivo (la persona puede subir
 * otro comprobante). Si el monto recibido es menor, la API no deja validar:
 * se ofrece rechazar con "Monto no coincide".
 */
@Component({
  selector: 'adm-transfer-review-dialog',
  imports: [FormsModule, Dialog, DialogActions, FormActions],
  templateUrl: './transfer-review-dialog.html',
  styles: `
    .form {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }
    p {
      margin: 0;
    }
    .row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 11rem), 1fr));
      gap: var(--space-3);
    }
    .choices {
      display: grid;
      gap: var(--space-2);
      margin-top: var(--space-2);
    }
  `,
})
export class TransferReviewDialog {
  readonly open = model(false);
  readonly mode = model<TransferReview>('validate');
  readonly payment = input.required<AdminPaymentDetailDto>();
  readonly done = output<{ payment: AdminPaymentDetailDto; mode: TransferReview }>();

  private readonly api = inject(AdminPaymentsApi);
  private readonly errors = inject(ErrorPresenter);
  protected readonly money = formatMoney;
  protected readonly reasonLabels = REJECTION_REASON_LABELS;
  protected readonly reasons = TRANSFER_REJECTION_REASON_VALUES;

  protected readonly busy = signal(false);
  protected readonly received = signal<number | null>(null);
  protected readonly receivedOn = signal('');
  protected readonly reason = signal<TransferRejectionReason>('ILLEGIBLE');
  protected readonly note = signal('');
  protected readonly error = signal<string | null>(null);
  /** El monto recibido es menor que el esperado (solo se puede rechazar). */
  protected readonly shortBy = signal<number | null>(null);
  protected readonly shortByText = computed(() => {
    const cents = this.shortBy();
    return cents === null ? null : this.money({ amountCents: cents, currency: 'MXN' });
  });
  protected readonly today = isoToZonedInput(new Date().toISOString()).slice(0, 10);
  protected readonly expected = computed(() => this.payment().transfer?.expectedAmount ?? null);

  constructor() {
    effect(() => {
      if (!this.open()) return;
      untracked(() => {
        const t = this.payment().transfer;
        const amount = t?.declaredAmount ?? t?.expectedAmount;
        this.received.set(amount ? amount.amountCents / 100 : null);
        this.receivedOn.set(t?.declaredPaidOn?.slice(0, 10) ?? this.today);
        this.reason.set('ILLEGIBLE');
        this.note.set('');
        this.error.set(null);
        this.shortBy.set(null);
      });
    });
  }

  protected async save(): Promise<void> {
    if (this.mode() === 'validate') await this.validate();
    else await this.reject();
  }

  /** Pasa a rechazar con "Monto no coincide" (tras un monto menor al esperado). */
  protected rejectMismatch(): void {
    this.mode.set('reject');
    this.reason.set('AMOUNT_MISMATCH');
    this.error.set(null);
  }

  private async validate(): Promise<void> {
    const cents = Math.round((this.received() ?? 0) * 100);
    if (cents < 1 || !this.receivedOn() || this.receivedOn() > this.today) {
      this.error.set('Escribe el monto recibido y una fecha que no sea futura.');
      return;
    }
    this.error.set(null);
    this.shortBy.set(null);
    await this.run(
      () =>
        this.api.validateTransfer(this.payment().id, {
          receivedAmountCents: cents,
          receivedOn: this.receivedOn(),
        }),
      (error) => {
        const apiError = toApiError(error);
        if (apiError.code !== 'PAYMENT_TRANSFER_AMOUNT_MISMATCH') return false;
        this.shortBy.set(apiError.metaNumber('differenceCents'));
        return true;
      },
    );
  }

  private async reject(): Promise<void> {
    const note = this.note().trim();
    if (this.reason() === 'OTHER' && !note) {
      this.error.set('Con «Otro», explica el motivo a la persona.');
      return;
    }
    this.error.set(null);
    await this.run(() =>
      this.api.rejectTransfer(this.payment().id, {
        reason: this.reason(),
        note: note || undefined,
      }),
    );
  }

  /** Envía la petición; `handled` puede resolver un error sin la alerta genérica. */
  private async run(
    request: () => ReturnType<AdminPaymentsApi['validateTransfer']>,
    handled: (error: unknown) => boolean = () => false,
  ): Promise<void> {
    this.busy.set(true);
    try {
      const payment = await firstValueFrom(request());
      this.open.set(false);
      this.done.emit({ payment, mode: this.mode() });
    } catch (error) {
      if (!handled(error)) void this.errors.present(error);
    } finally {
      this.busy.set(false);
    }
  }
}
