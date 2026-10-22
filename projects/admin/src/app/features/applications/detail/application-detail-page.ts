import { Component, computed, effect, inject, input, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AdminStatusEventDto } from 'data-access';
import { Notice } from '../../../shared/notice/notice';
import { RequestState } from '../../../shared/request-state/request-state';
import { SCHOLARSHIP_LEVEL_LABELS } from '../../offers/offer-labels';
import { formatBytes } from '../../offers/content/content-labels';
import {
  APPLICATION_KIND_LABELS,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_TONES,
  formatDateTime,
} from '../application-labels';
import { ApplicationStore } from './application-store';
import { DecisionPanel } from './decision-panel';
import { EvaluationPanel } from './evaluation-panel';
import { FollowUpPanel } from './follow-up-panel';
import { InterviewPanel } from './interview-panel';

/**
 * Detalle de una postulación (HU-31): datos, respuestas, evidencias e
 * historial; a un lado, evaluación del comité, entrevista, decisión y, si ya
 * se aprobó, el seguimiento (HU-32). Abrirla puede pasarla a "En revisión".
 */
@Component({
  selector: 'adm-application-detail-page',
  imports: [
    RouterLink,
    Notice,
    RequestState,
    EvaluationPanel,
    InterviewPanel,
    DecisionPanel,
    FollowUpPanel,
  ],
  providers: [ApplicationStore],
  templateUrl: './application-detail-page.html',
  styleUrl: './application-detail-page.scss',
})
export default class ApplicationDetailPage {
  protected readonly store = inject(ApplicationStore);
  private readonly router = inject(Router);

  readonly id = input.required<string>();
  /** Pestaña de la bandeja de la que se viene (`?tipo=`). */
  readonly tipo = input<string>();

  protected readonly app = this.store.application;
  protected readonly statusLabels = APPLICATION_STATUS_LABELS;
  protected readonly statusTones = APPLICATION_STATUS_TONES;
  protected readonly kindLabels = APPLICATION_KIND_LABELS;
  protected readonly levelLabels = SCHOLARSHIP_LEVEL_LABELS;
  protected readonly formatDateTime = formatDateTime;
  protected readonly formatBytes = formatBytes;

  protected readonly backQuery = computed(() => (this.tipo() ? { tipo: this.tipo() } : {}));
  /** El detalle mostrado es de otra postulación (se está cargando la nueva). */
  protected readonly stale = computed(() => this.store.loading() && this.app()?.id !== this.id());

  protected readonly location = computed(() => {
    const c = this.app()?.contact;
    return c ? [c.municipalityName, c.divisionName, c.countryCode].filter(Boolean).join(', ') : '';
  });

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => void this.store.load(id));
    });
  }

  protected go(id: string | null): void {
    if (id) void this.router.navigate(['/postulaciones', id], { queryParams: this.backQuery() });
  }

  protected actorName(event: AdminStatusEventDto): string {
    if (event.actor) return event.actor.fullName;
    return event.actorType === 'PARTICIPANT' ? 'Postulante' : 'Sistema';
  }
}
