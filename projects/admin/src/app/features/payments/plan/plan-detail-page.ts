import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AdminPaymentPlanDto,
  AdminPaymentsApi,
  PaymentPlanAction,
  requestState,
} from 'data-access';
import { firstValueFrom, Observable } from 'rxjs';
import { AlertService, Button } from 'ui-kit';
import { AdminAccess } from '../../../core/access/admin-access';
import { ErrorPresenter } from '../../../core/error-presenter';
import { formatDateTime, formatMoney } from '../../../shared/format/format';
import { Notice } from '../../../shared/notice/notice';
import { ReasonDialog } from '../../../shared/reason-dialog/reason-dialog';
import { RequestState } from '../../../shared/request-state/request-state';
import { ENROLLMENT_STATUS_LABELS } from '../../offers/attendance/attendance-labels';
import { formatOfferDate } from '../../offers/shared/zoned-time';
import {
  INSTALLMENT_STATUS_LABELS,
  PAYMENT_CONCEPT_LABELS,
  PLAN_STATUS_LABELS,
  PLAN_STATUS_TONES,
  formatCard,
} from '../payment-labels';
import { InstallmentDots } from './installment-dots';

/** Acciones que piden motivo. */
type ReasonAction = Extract<PaymentPlanAction, 'SUSPEND_ACCESS' | 'RESTORE_ACCESS' | 'CANCEL'>;

const REASON_ACTIONS: Readonly<
  Record<ReasonAction, { title: string; submit: string; lead: string; done: string }>
> = {
  SUSPEND_ACCESS: {
    title: 'Suspender acceso',
    submit: 'Suspender acceso',
    lead: 'La persona deja de entrar al aula y ve un aviso. Si regulariza el pago, el acceso vuelve solo.',
    done: 'Se suspendió el acceso al aula.',
  },
  RESTORE_ACCESS: {
    title: 'Restablecer acceso',
    submit: 'Restablecer acceso',
    lead: 'La persona vuelve a entrar al aula aunque el plan siga en mora, y se le avisa.',
    done: 'Se restableció el acceso al aula.',
  },
  CANCEL: {
    title: 'Cancelar plan',
    submit: 'Cancelar plan',
    lead: 'Las cuotas programadas o fallidas ya no se cobran. La inscripción no cambia.',
    done: 'Se canceló el plan de cuotas.',
  },
};

/**
 * Detalle de un plan de cuotas (HU-33): estado, cuotas, tarjeta y acceso.
 * Con `payments.manage`, las acciones que su estado permite
 * (`availableActions`): reintentar cobro, marcar en mora, suspender o
 * restablecer el acceso y cancelar.
 */
@Component({
  selector: 'adm-plan-detail-page',
  imports: [RouterLink, Button, Notice, RequestState, ReasonDialog, InstallmentDots],
  templateUrl: './plan-detail-page.html',
  styleUrl: '../detail.scss',
})
export default class PlanDetailPage {
  /** `/pagos/planes/:id`. */
  readonly id = input.required<string>();

  private readonly api = inject(AdminPaymentsApi);
  private readonly errors = inject(ErrorPresenter);
  private readonly alerts = inject(AlertService);
  private readonly access = inject(AdminAccess);

  protected readonly plan = requestState<AdminPaymentPlanDto>();
  protected readonly notice = signal('');
  protected readonly busy = signal(false);

  protected readonly statusLabels = PLAN_STATUS_LABELS;
  protected readonly statusTones = PLAN_STATUS_TONES;
  protected readonly installmentLabels = INSTALLMENT_STATUS_LABELS;
  protected readonly conceptLabels = PAYMENT_CONCEPT_LABELS;
  protected readonly enrollmentLabels = ENROLLMENT_STATUS_LABELS;
  protected readonly money = formatMoney;
  protected readonly card = formatCard;
  protected readonly formatDateTime = formatDateTime;
  protected readonly formatDate = formatOfferDate;

  /** Acciones habilitadas por estado y por permiso. */
  protected readonly actions = computed<ReadonlySet<PaymentPlanAction>>(() =>
    this.access.can('payments.manage')
      ? new Set(this.plan.data()?.availableActions ?? [])
      : new Set(),
  );

  protected readonly reasonOpen = signal(false);
  protected readonly reasonAction = signal<ReasonAction>('CANCEL');
  protected readonly reasonCopy = computed(() => REASON_ACTIONS[this.reasonAction()]);

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => void this.plan.run(this.api.planDetail(id)));
    });
  }

  protected reload(): void {
    void this.plan.run(this.api.planDetail(this.id()));
  }

  protected async retry(): Promise<void> {
    const ok = await this.alerts.confirm(
      '¿Reintentar el cobro?',
      'Se cobran ahora las cuotas fallidas con la tarjeta registrada. Si pasa, el plan queda al día y se restablece el acceso.',
      { confirmLabel: 'Cobrar ahora', variant: 'info' },
    );
    if (ok)
      await this.run(() => this.api.retryPlan(this.id()), 'El cobro pasó: el plan quedó al día.');
  }

  protected async markDelinquent(): Promise<void> {
    const ok = await this.alerts.confirm(
      '¿Marcar el plan en mora?',
      'Se avisa a la persona. Con la regla actual, pasar a mora también suspende su acceso al aula.',
      { confirmLabel: 'Marcar en mora' },
    );
    if (ok) await this.run(() => this.api.markDelinquent(this.id()), 'El plan quedó en mora.');
  }

  protected askReason(action: ReasonAction): void {
    this.reasonAction.set(action);
    this.reasonOpen.set(true);
  }

  protected async confirmReason(reason: string): Promise<void> {
    const id = this.id();
    const action = this.reasonAction();
    const request =
      action === 'SUSPEND_ACCESS'
        ? this.api.suspendAccess(id, { reason })
        : action === 'RESTORE_ACCESS'
          ? this.api.restoreAccess(id, { reason })
          : this.api.cancelPlan(id, { reason });
    if (await this.run(() => request, REASON_ACTIONS[action].done)) this.reasonOpen.set(false);
  }

  private async run(
    request: () => Observable<AdminPaymentPlanDto>,
    message: string,
  ): Promise<boolean> {
    this.busy.set(true);
    try {
      this.plan.set(await firstValueFrom(request()));
      this.notice.set(message);
      return true;
    } catch (error) {
      void this.errors.present(error);
      return false;
    } finally {
      this.busy.set(false);
    }
  }
}
