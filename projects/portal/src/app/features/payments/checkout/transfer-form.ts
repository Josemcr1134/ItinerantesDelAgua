import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  BankTransferDetailsDto,
  PaymentDto,
  PaymentsApi,
  TRANSFER_PROOF_CONTENT_TYPE_VALUES,
  toApiError,
} from 'data-access';
import { firstValueFrom } from 'rxjs';
import { formatMoney } from '../../../shared/applications/application-format';
import { PAYMENT_TEXTS, REJECTION_LABELS } from '../payment-texts';

const MAX_BYTES = 5 * 1_048_576;

/** Hoy (YYYY-MM-DD) en la zona del navegador. */
const today = () => new Date().toLocaleDateString('en-CA');

/**
 * Transferencia SPEI (HU-23, solo México y saldo en MXN): datos bancarios con
 * la referencia única y el envío del comprobante con monto, fecha y clave de
 * rastreo. Queda "Pendiente de validación" (el equipo lo revisa).
 */
@Component({
  selector: 'portal-transfer-form',
  imports: [ReactiveFormsModule],
  templateUrl: './transfer-form.html',
  styleUrl: './transfer-form.scss',
})
export class TransferForm {
  private readonly api = inject(PaymentsApi);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly applicationId = input.required<string>();
  readonly bank = input.required<BankTransferDetailsDto>();
  readonly latest = input<PaymentDto | null>(null);
  readonly sent = output<PaymentDto>();

  protected readonly t = PAYMENT_TEXTS.transferForm;
  protected readonly money = formatMoney;
  protected readonly accept = TRANSFER_PROOF_CONTENT_TYPE_VALUES.join(',');
  protected readonly maxDate = today();
  protected readonly file = signal<File | null>(null);
  protected readonly fileError = signal<string | null>(null);
  protected readonly sending = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly copied = signal<string | null>(null);

  protected readonly form = this.fb.group({
    declared: ['', [Validators.required, Validators.min(1)]],
    paidOn: [today(), Validators.required],
    trackingKey: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]+$/)]],
  });

  protected readonly rejected = computed(() => {
    const latest = this.latest();
    if (latest?.status !== 'REJECTED') return null;
    const reason = latest.transfer?.rejectionReason;
    return this.t.rejected(
      latest.transfer?.rejectionNote || (reason ? REJECTION_LABELS[reason] : ''),
    );
  });
  protected readonly pending = computed(() => this.latest()?.status === 'PENDING_VALIDATION');

  constructor() {
    // El monto esperado como sugerencia (la persona escribe el que transfirió).
    effect(() => {
      const amount = this.bank().amount.amountCents / 100;
      untracked(() => this.form.controls.declared.setValue(String(amount)));
    });
  }

  protected async copy(value: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      this.copied.set(value);
      setTimeout(() => this.copied.set(null), 2_000);
    } catch {
      // Sin portapapeles: el dato sigue a la vista para copiarlo a mano.
    }
  }

  protected pick(files: FileList | null): void {
    const file = files?.[0] ?? null;
    const valid =
      !!file &&
      (TRANSFER_PROOF_CONTENT_TYPE_VALUES as readonly string[]).includes(file.type) &&
      file.size <= MAX_BYTES;
    this.file.set(valid ? file : null);
    this.fileError.set(file && !valid ? this.t.invalidFile : null);
  }

  protected async submit(): Promise<void> {
    const file = this.file();
    if (!file) this.fileError.set(this.t.invalidFile);
    if (this.form.invalid || !file) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.sending.set(true);
    this.error.set(null);
    try {
      const payment = await firstValueFrom(
        this.api.submitTransfer(file, {
          applicationId: this.applicationId(),
          declaredAmountCents: Math.round(Number(v.declared) * 100),
          paidOn: v.paidOn,
          trackingKey: v.trackingKey.trim().toUpperCase(),
        }),
      );
      this.sent.emit(payment);
    } catch (error) {
      this.error.set(toApiError(error).message);
    } finally {
      this.sending.set(false);
    }
  }
}
