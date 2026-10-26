import { Component, computed, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApplicationDetailDto, ApplicationsApi, toApiError } from 'data-access';
import { firstValueFrom } from 'rxjs';
import { AlertService } from 'ui-kit';
import {
  ACTION_LABELS,
  ACTION_REASON_LABELS,
  APPLICATION_STATUS_LABELS,
  TIMELINE_LABELS,
} from '../../../shared/applications/application-labels';
import { timeIn } from '../../calendar/calendar-time';
import { ApplicationSteps } from '../application-steps/application-steps';
import { dateTimeIn } from '../../../shared/applications/application-format';
import { documentOpener } from '../../../shared/applications/open-document';

/**
 * "Ver mi postulación" (HU-21): estado y folio, línea de tiempo, entrevista,
 * la acción que toque (confirmar, entrar a la entrevista, ir al aula) y lo
 * que se envió, con los archivos.
 */
@Component({
  selector: 'portal-application-summary',
  imports: [RouterLink, ApplicationSteps],
  templateUrl: './application-summary.html',
  styleUrl: './application-summary.scss',
})
export class ApplicationSummary {
  private readonly api = inject(ApplicationsApi);
  private readonly alerts = inject(AlertService);

  readonly application = input.required<ApplicationDetailDto>();
  readonly timezone = input.required<string>();
  readonly changed = output<ApplicationDetailDto>();

  protected readonly statuses = APPLICATION_STATUS_LABELS;
  protected readonly steps = TIMELINE_LABELS;
  protected readonly actions = ACTION_LABELS;
  protected readonly reasons = ACTION_REASON_LABELS;
  protected readonly busy = signal(false);
  private readonly openFile = documentOpener();

  protected readonly interviewTime = computed(() => {
    const interview = this.application().interview;
    if (!interview) return null;
    const own = this.format(interview.startsAt);
    const cdmx = timeIn(interview.startsAt, 'America/Mexico_City');
    return this.timezone() === 'America/Mexico_City' ? own : `${own} (${cdmx} hora CDMX)`;
  });

  protected format(iso: string): string {
    return dateTimeIn(iso, this.timezone());
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

  protected openDocument(documentId: string): Promise<void> {
    return this.openFile(this.application().id, documentId);
  }
}
