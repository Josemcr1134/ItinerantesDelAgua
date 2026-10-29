import { Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PaymentDto, PaymentsApi, toApiError } from 'data-access';
import { firstValueFrom } from 'rxjs';
import { usePageHeading } from '../../../core/page-heading/page-heading';
import { ExternalNavigation } from '../../../shared/external-navigation';
import { PAYMENT_TEXTS } from '../payment-texts';

/** Cada cuánto y hasta cuándo se consulta el pago al volver de Stripe (API: 2–3 s, ~1 min). */
export const POLL_MS = 2_500;
export const POLL_LIMIT_MS = 60_000;

type View = 'processing' | 'paid' | 'cancelled' | 'failed' | 'slow' | 'error';

/**
 * Vuelta de Stripe (HU-22/23/24: `/pagos/resultado?paymentId=…&result=…`):
 * "Procesando pago…" hasta que la API confirma (Pagado → folio, al aula y el
 * comprobante), no se completa (Reintentar) o se cancela ("no se realizó
 * ningún cargo"). Si tras ~1 min sigue pendiente, se avisará por correo.
 */
@Component({
  selector: 'portal-payment-result-page',
  imports: [RouterLink],
  templateUrl: './payment-result-page.html',
  styleUrl: './payment-result-page.scss',
})
export default class PaymentResultPage implements OnInit {
  private readonly api = inject(PaymentsApi);
  private readonly external = inject(ExternalNavigation);
  private readonly destroyRef = inject(DestroyRef);

  readonly paymentId = input<string>();
  /** `success` o `cancel` (lo manda Stripe). */
  readonly result = input<string>();

  protected readonly texts = PAYMENT_TEXTS;
  protected readonly t = PAYMENT_TEXTS.result;
  protected readonly view = signal<View>('processing');
  protected readonly payment = signal<PaymentDto | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly retryLink = computed(() => {
    const p = this.payment();
    if (!p) return null;
    return p.applicationId ? { postulacion: p.applicationId } : { oferta: p.offer.id };
  });

  private timer: ReturnType<typeof setTimeout> | null = null;
  private stopped = false;

  constructor() {
    usePageHeading().set({ title: 'Pago' });
    this.destroyRef.onDestroy(() => {
      this.stopped = true;
      if (this.timer) clearTimeout(this.timer);
    });
  }

  ngOnInit(): void {
    void this.start();
  }

  protected async downloadReceipt(): Promise<void> {
    const p = this.payment();
    if (!p) return;
    try {
      this.external.save(
        await firstValueFrom(this.api.receipt(p.id, `comprobante-${p.folio}.pdf`)),
      );
    } catch (error) {
      this.error.set(toApiError(error).message);
    }
  }

  private async start(): Promise<void> {
    const id = this.paymentId();
    if (!id) {
      this.view.set('error');
      return;
    }
    if (this.result() === 'cancel') {
      // Cierra el checkout y libera el cupo (si Stripe ya cobró, queda Pagado).
      await firstValueFrom(this.api.cancel(id)).catch(() => undefined);
    }
    void this.poll(id, Date.now());
  }

  private async poll(id: string, startedAt: number): Promise<void> {
    if (this.stopped) return;
    try {
      const payment = await firstValueFrom(this.api.get(id, { silent: true }));
      this.payment.set(payment);
      switch (payment.status) {
        case 'PAID':
        case 'VALIDATED':
          this.view.set('paid');
          return;
        // Cancelado al volver con "cancel"; si Stripe dijo "success", no se completó.
        case 'CANCELLED':
          this.view.set(this.result() === 'cancel' ? 'cancelled' : 'failed');
          return;
        case 'FAILED':
          this.view.set('failed');
          return;
        case 'PENDING_VALIDATION':
          this.view.set('slow');
          return;
      }
    } catch (error) {
      this.error.set(toApiError(error).message);
      this.view.set('error');
      return;
    }
    if (Date.now() - startedAt >= POLL_LIMIT_MS) {
      this.view.set('slow');
      return;
    }
    this.timer = setTimeout(() => void this.poll(id, startedAt), POLL_MS);
  }
}
