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
import { AdminPaymentDetailDto, AdminPaymentsApi } from 'data-access';
import { firstValueFrom } from 'rxjs';
import { Dialog, DialogActions } from 'ui-kit';
import { ErrorPresenter } from '../../../core/error-presenter';
import { FormActions } from '../../../shared/form-actions/form-actions';
import { formatMoney } from '../../../shared/format/format';

/**
 * Reembolsar un pago, total o parcial (hasta lo aún reembolsable). Con
 * tarjeta se procesa en Stripe; con transferencia se registra lo devuelto
 * fuera de la plataforma. La inscripción no cambia.
 */
@Component({
  selector: 'adm-refund-dialog',
  imports: [FormsModule, Dialog, DialogActions, FormActions],
  template: `
    <ui-dialog [(open)]="open" title="Reembolsar" [busy]="busy()">
      <form id="refund-form" class="form" (ngSubmit)="save()">
        <p>
          @if (payment().method === 'CARD') {
            Se devuelve a la tarjeta por Stripe; puede quedar «en proceso» unos días.
          } @else {
            Registra una devolución que ya hiciste por transferencia (la plataforma no mueve el
            dinero).
          }
          La inscripción no cambia.
        </p>
        <div class="adm-field amount">
          <label class="adm-field__label" for="refund-amount"
            >Monto ({{ payment().amount.currency }})</label
          >
          <input
            id="refund-amount"
            class="adm-field__input"
            type="number"
            name="amount"
            inputmode="decimal"
            step="0.01"
            min="0.01"
            [max]="maxAmount()"
            required
            [(ngModel)]="amount"
            aria-describedby="refund-amount-hint"
          />
          <p id="refund-amount-hint" class="adm-field__hint">
            Hasta {{ money(payment().refundable) }}.
          </p>
        </div>
        <div class="adm-field">
          <label class="adm-field__label" for="refund-reason">Motivo</label>
          <textarea
            id="refund-reason"
            class="adm-field__input"
            name="reason"
            rows="3"
            maxlength="500"
            required
            [(ngModel)]="reason"
          ></textarea>
        </div>
        @if (error()) {
          <p class="adm-field__error" role="alert">{{ error() }}</p>
        }
      </form>
      <div uiDialogActions>
        <adm-form-actions
          form="refund-form"
          [submitLabel]="payment().method === 'CARD' ? 'Reembolsar' : 'Registrar reembolso'"
          [busy]="busy()"
          (cancel)="open.set(false)"
        />
      </div>
    </ui-dialog>
  `,
  styles: `
    .form {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }
    p {
      margin: 0;
    }
    .amount {
      max-width: 14rem;
    }
  `,
})
export class RefundDialog {
  readonly open = model(false);
  readonly payment = input.required<AdminPaymentDetailDto>();
  readonly done = output<AdminPaymentDetailDto>();

  private readonly api = inject(AdminPaymentsApi);
  private readonly errors = inject(ErrorPresenter);
  protected readonly money = formatMoney;
  protected readonly busy = signal(false);
  protected readonly amount = signal<number | null>(null);
  protected readonly reason = signal('');
  protected readonly error = signal<string | null>(null);
  protected readonly maxAmount = computed(() => this.payment().refundable.amountCents / 100);

  constructor() {
    effect(() => {
      if (!this.open()) return;
      untracked(() => {
        this.amount.set(this.maxAmount());
        this.reason.set('');
        this.error.set(null);
      });
    });
  }

  protected async save(): Promise<void> {
    const cents = Math.round((this.amount() ?? 0) * 100);
    const reason = this.reason().trim();
    if (cents < 1 || cents > this.payment().refundable.amountCents) {
      this.error.set(
        `Escribe un monto mayor que 0 y de hasta ${this.money(this.payment().refundable)}.`,
      );
      return;
    }
    if (!reason) {
      this.error.set('Escribe el motivo.');
      return;
    }
    this.error.set(null);
    this.busy.set(true);
    try {
      const updated = await firstValueFrom(
        this.api.refund(this.payment().id, { amountCents: cents, reason }),
      );
      this.open.set(false);
      this.done.emit(updated);
    } catch (error) {
      void this.errors.present(error);
    } finally {
      this.busy.set(false);
    }
  }
}
