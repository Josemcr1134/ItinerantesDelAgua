import { Component, computed, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ApplicationCardDto,
  ApplicationDetailDto,
  ApplicationsApi,
  TimelineStepState,
  toApiError,
} from 'data-access';
import { firstValueFrom } from 'rxjs';
import { AlertService } from 'ui-kit';
import { dateIn, formatMoney, percentLabel } from '../../../shared/applications/application-format';
import {
  ACTION_LABELS,
  ACTION_REASON_LABELS,
  APPLICATION_STATUS_LABELS,
} from '../../../shared/applications/application-labels';
import { dayKeyIn, timeIn } from '../../calendar/calendar-time';
import {
  CDMX,
  daysLeftLabel,
  STATUS_TONES,
  STEP_LABELS,
  weekdayDateIn,
  zoneName,
} from '../scholarship-format';

const STATE_LABELS: Readonly<Record<TimelineStepState, string>> = {
  DONE: 'completado',
  CURRENT: 'en curso',
  UPCOMING: 'pendiente',
  SKIPPED: 'no aplica',
  FAILED: 'no completado',
};

/**
 * Seguimiento de una postulación a beca (Figma "Mis postulaciones"): estado,
 * folio, avance (Enviada › En revisión › Resultado › Pago › Inscrita), el
 * resultado con el saldo a pagar, la entrevista y la acción que toque.
 */
@Component({
  selector: 'portal-scholarship-tracker',
  imports: [RouterLink],
  templateUrl: './scholarship-tracker.html',
  styleUrls: [
    './scholarship-tracker.scss',
    './scholarship-tracker-boxes.scss',
    '../scholarship-badge.scss',
  ],
})
export class ScholarshipTracker {
  private readonly api = inject(ApplicationsApi);
  private readonly alerts = inject(AlertService);

  readonly application = input.required<ApplicationCardDto>();
  readonly timezone = input.required<string>();
  /** Ya se está viendo la postulación (sin [Ver postulación]). */
  readonly detail = input(false);
  readonly changed = output<ApplicationDetailDto>();

  protected readonly statuses = APPLICATION_STATUS_LABELS;
  protected readonly tones = STATUS_TONES;
  protected readonly labels = STEP_LABELS;
  protected readonly stateLabels = STATE_LABELS;
  protected readonly actions = ACTION_LABELS;
  protected readonly reasons = ACTION_REASON_LABELS;
  protected readonly money = formatMoney;
  protected readonly busy = signal(false);

  protected readonly steps = computed(() =>
    this.application().timeline.filter((step) => step.state !== 'SKIPPED'),
  );

  /** "Beca", o el tipo solicitado si ya se conoce ("Beca especial (70%–80%)"). */
  protected readonly requested = computed(() => {
    const type = this.application().scholarshipResult?.requestedScholarshipType;
    return type ? `${type.name} (${percentLabel(type)})` : 'Beca';
  });

  protected readonly result = computed(() => {
    const result = this.application().scholarshipResult;
    if (!result) return null;
    const original = result.originalAmount;
    return {
      ...result,
      requestedPercent: result.requestedScholarshipType
        ? percentLabel(result.requestedScholarshipType)
        : '—',
      discount:
        original && original.currency === result.balance.currency
          ? {
              amountCents: original.amountCents - result.balance.amountCents,
              currency: original.currency,
            }
          : null,
      showDue: this.application().status === 'APPROVED_PENDING_PAYMENT' && !!result.dueAt,
    };
  });

  /** Entrevista agendada: fecha y hora en la zona de la persona y en CDMX. */
  protected readonly interview = computed(() => {
    const a = this.application();
    if (a.status !== 'INTERVIEW_SCHEDULED' || !a.interview) return null;
    const zone = this.timezone();
    const startsAt = a.interview.startsAt;
    return {
      date: weekdayDateIn(startsAt, zone),
      own: timeIn(startsAt, zone),
      cdmx: zone === CDMX ? null : timeIn(startsAt, CDMX),
      zone: zoneName(zone),
      day: dayKeyIn(startsAt, zone),
      url: a.action.type === 'JOIN_INTERVIEW' && a.action.enabled ? a.interview.join.url : null,
    };
  });

  protected date(iso: string): string {
    return dateIn(iso, this.timezone());
  }

  protected daysLeft(iso: string): string {
    return daysLeftLabel(iso);
  }

  protected async confirm(): Promise<void> {
    this.busy.set(true);
    try {
      this.changed.emit(await firstValueFrom(this.api.confirm(this.application().id)));
    } catch (error) {
      await this.alerts.error('No se pudo confirmar', toApiError(error).message);
    } finally {
      this.busy.set(false);
    }
  }
}
