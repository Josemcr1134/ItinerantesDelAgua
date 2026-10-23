import { Component, inject, signal } from '@angular/core';
import { AdminApplicationEmailDto, AdminApplicationsApi, ApplicationDecision } from 'data-access';
import { firstValueFrom } from 'rxjs';
import { Button } from 'ui-kit';
import { SCHOLARSHIP_LEVEL_LABELS } from '../../offers/offer-labels';
import { formatOfferDate } from '../../offers/shared/zoned-time';
import { EMAIL_STATUS_LABELS } from '../application-labels';
import { formatDateTime, formatMoney } from '../../../shared/format/format';
import { ApplicationStore } from './application-store';
import { DecisionDialog } from './decision-dialog';

/**
 * Decisión (HU-31): aprobar o no seleccionar (con vista previa del correo),
 * la decisión registrada y los avisos enviados al postulante, con
 * "Reintentar envío" si un correo falló.
 */
@Component({
  selector: 'adm-decision-panel',
  imports: [Button, DecisionDialog],
  template: `
    @if (store.application(); as a) {
      <section class="adm-section" aria-labelledby="decision-title">
        <h2 id="decision-title" class="adm-section__title">Decisión</h2>

        @if (a.decision.decidedAt) {
          <dl class="summary">
            @if (a.decision.assignedLevel) {
              <div>
                <dt>Nivel asignado</dt>
                <dd>
                  {{ levelLabels[a.decision.assignedLevel] }}
                  @if (a.decision.assignedPercent !== null) {
                    ({{ a.decision.assignedPercent }}%)
                  }
                </dd>
              </div>
            }
            @if (a.decision.balance) {
              <div>
                <dt>Saldo</dt>
                <dd>{{ money(a.decision.balance) }}</dd>
              </div>
            }
            @if (a.decision.responseDueAt) {
              <div>
                <dt>Plazo</dt>
                <dd>{{ formatDate(a.decision.responseDueAt) }}</dd>
              </div>
            }
            <div>
              <dt>Registrada</dt>
              <dd>
                {{ formatDateTime(a.decision.decidedAt) }}
                @if (a.decision.decidedBy) {
                  · {{ a.decision.decidedBy.fullName }}
                }
              </dd>
            </div>
          </dl>
          @if (a.decision.decisionNote) {
            <p class="note">
              <span class="visually-hidden">Nota interna: </span>{{ a.decision.decisionNote }}
            </p>
          }
          @if (a.decision.emailStatus === 'FAILED') {
            <p class="adm-callout" role="status">
              Correo no enviado: el postulante sí ve la decisión en su portal.
            </p>
          }
        } @else if (store.canDecide()) {
          @if (a.decision.blockedReason === 'APPLICATION_INTERVIEW_REQUIRED') {
            <p class="adm-callout adm-callout--info">
              Para aprobarla hace falta una entrevista por Zoom «Realizada».
            </p>
          }
          @if (a.decision.price; as price) {
            <p class="muted">Precio de la oferta: {{ money(price) }}</p>
          }
          <div class="adm-actions panel-actions">
            <button uiButton type="button" [disabled]="store.busy()" (click)="decide('APPROVE')">
              Aprobar
            </button>
            <button
              uiButton
              variant="secondary"
              type="button"
              [disabled]="store.busy()"
              (click)="decide('REJECT')"
            >
              No seleccionar
            </button>
          </div>
        } @else {
          <p class="muted">Aún sin decisión.</p>
        }

        @if (a.emails.length) {
          <h3 class="panel-sub">Avisos al postulante</h3>
          <ul class="plain emails">
            @for (email of a.emails; track email.notificationId) {
              <li class="emails__item">
                <span class="emails__title">{{ email.title }}</span>
                <span class="muted">
                  {{ emailLabels[email.emailStatus] }}
                  · {{ formatDateTime(email.emailSentAt ?? email.createdAt) }}
                </span>
                @if (email.emailStatus === 'FAILED' && store.canRetryEmail()) {
                  <button
                    type="button"
                    class="adm-action"
                    [disabled]="store.busy()"
                    (click)="retry(email)"
                  >
                    Reintentar envío<span class="visually-hidden"> de «{{ email.title }}»</span>
                  </button>
                }
              </li>
            }
          </ul>
        }
      </section>

      @if (store.canDecide()) {
        <adm-decision-dialog [(open)]="deciding" [decision]="decision()" />
      }
    }
  `,
  styleUrl: './panels.scss',
})
export class DecisionPanel {
  protected readonly store = inject(ApplicationStore);
  private readonly api = inject(AdminApplicationsApi);

  protected readonly levelLabels = SCHOLARSHIP_LEVEL_LABELS;
  protected readonly emailLabels = EMAIL_STATUS_LABELS;
  protected readonly money = formatMoney;
  protected readonly formatDate = formatOfferDate;
  protected readonly formatDateTime = formatDateTime;

  protected readonly deciding = signal(false);
  protected readonly decision = signal<ApplicationDecision>('APPROVE');

  protected decide(decision: ApplicationDecision): void {
    this.decision.set(decision);
    this.deciding.set(true);
  }

  protected async retry(email: AdminApplicationEmailDto): Promise<void> {
    const result = await this.store.run((id) =>
      firstValueFrom(this.api.retryEmail(id, { notificationId: email.notificationId })),
    );
    if (!result) return;
    await this.store.refresh();
    this.store.notice.set(
      result.emailStatus === 'FAILED'
        ? `El correo «${email.title}» volvió a fallar. Inténtalo más tarde.`
        : `Se reenvió el correo «${email.title}».`,
    );
  }
}
