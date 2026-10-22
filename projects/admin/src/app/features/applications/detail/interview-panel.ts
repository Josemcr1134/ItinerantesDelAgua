import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApplicationsApi, InterviewOutcome } from 'data-access';
import { AlertService, Button, Dialog, DialogActions } from 'ui-kit';
import { FormActions } from '../../../shared/form-actions/form-actions';
import { formatDateTime, INTERVIEW_STATUS_LABELS } from '../application-labels';
import { ApplicationStore } from './application-store';
import { InterviewDialog } from './interview-dialog';

/**
 * Entrevista por Zoom (HU-31): la vigente y las anteriores; agendar,
 * reprogramar, marcarla "Realizada" o "No asistió" y cancelarla. Es
 * requisito para aprobar convocatorias y becas de más de 70%.
 */
@Component({
  selector: 'adm-interview-panel',
  imports: [FormsModule, Button, Dialog, DialogActions, FormActions, InterviewDialog],
  template: `
    @if (store.application(); as a) {
      @if (a.interviews.length || a.requiresInterview || store.canInterview()) {
        <section class="adm-section" aria-labelledby="interview-title">
          <h2 id="interview-title" class="adm-section__title">Entrevista</h2>
          @if (a.requiresInterview && !a.decision.hasCompletedInterview) {
            <p class="adm-callout adm-callout--info">
              Esta postulación requiere entrevista por Zoom «Realizada» para aprobarse.
            </p>
          }

          @if (scheduled(); as s) {
            <div class="interview">
              <p class="interview__when">{{ formatDateTime(s.startsAt) }}</p>
              <p class="muted">
                Hora del centro de México
                @if (s.scheduledBy) {
                  · Agendó {{ s.scheduledBy.fullName }}
                }
              </p>
              <a class="adm-link" [href]="s.joinUrl" target="_blank" rel="noopener"
                >Abrir Zoom<span class="visually-hidden"> (se abre en otra pestaña)</span></a
              >
              @if (store.canInterview()) {
                <div class="adm-actions panel-actions">
                  <button
                    type="button"
                    class="adm-action"
                    [disabled]="store.busy()"
                    (click)="complete('COMPLETED')"
                  >
                    Marcar realizada
                  </button>
                  <button
                    type="button"
                    class="adm-action"
                    [disabled]="store.busy()"
                    (click)="complete('NO_SHOW')"
                  >
                    No asistió
                  </button>
                  <button
                    type="button"
                    class="adm-action"
                    [disabled]="store.busy()"
                    (click)="scheduling.set(true)"
                  >
                    Reprogramar
                  </button>
                  <button
                    type="button"
                    class="adm-action adm-action--danger"
                    [disabled]="store.busy()"
                    (click)="cancelling.set(true)"
                  >
                    Cancelar entrevista
                  </button>
                </div>
              }
            </div>
          } @else if (store.canInterview()) {
            <button
              uiButton
              variant="secondary"
              type="button"
              [disabled]="store.busy()"
              (click)="scheduling.set(true)"
            >
              Agendar entrevista
            </button>
          }

          @if (past().length) {
            <h3 class="panel-sub">Anteriores</h3>
            <ul class="plain">
              @for (i of past(); track i.id) {
                <li>
                  {{ formatDateTime(i.startsAt) }} ·
                  <strong>{{ statusLabels[i.status] }}</strong>
                </li>
              }
            </ul>
          }
        </section>

        @if (store.canInterview()) {
          <adm-interview-dialog [(open)]="scheduling" [current]="scheduled()" />
          <ui-dialog [(open)]="cancelling" title="Cancelar entrevista" [busy]="store.busy()">
            <form id="cancel-interview-form" class="form" (ngSubmit)="cancel()">
              <p>
                La postulación vuelve a «En revisión». Para cambiar la hora, mejor reprográmala.
              </p>
              <div class="adm-field">
                <label class="adm-field__label" for="cancel-note"
                  >Nota interna <span class="adm-field__hint">(opcional)</span></label
                >
                <textarea
                  id="cancel-note"
                  class="adm-field__input"
                  name="note"
                  rows="3"
                  maxlength="1000"
                  [(ngModel)]="cancelNote"
                ></textarea>
              </div>
            </form>
            <div uiDialogActions>
              <adm-form-actions
                form="cancel-interview-form"
                submitLabel="Cancelar entrevista"
                [busy]="store.busy()"
                (cancel)="cancelling.set(false)"
              />
            </div>
          </ui-dialog>
        }
      }
    }
  `,
  styleUrl: './panels.scss',
})
export class InterviewPanel {
  protected readonly store = inject(ApplicationStore);
  private readonly api = inject(AdminApplicationsApi);
  private readonly alerts = inject(AlertService);

  protected readonly statusLabels = INTERVIEW_STATUS_LABELS;
  protected readonly formatDateTime = formatDateTime;
  protected readonly scheduling = signal(false);
  protected readonly cancelling = signal(false);
  protected readonly cancelNote = signal('');

  protected readonly scheduled = computed(
    () => this.store.application()?.interviews.find((i) => i.status === 'SCHEDULED') ?? null,
  );
  protected readonly past = computed(
    () => this.store.application()?.interviews.filter((i) => i.status !== 'SCHEDULED') ?? [],
  );

  protected async complete(outcome: InterviewOutcome): Promise<void> {
    const ok = await this.alerts.confirm(
      outcome === 'COMPLETED' ? '¿Marcar la entrevista como realizada?' : '¿Marcar que no asistió?',
      outcome === 'COMPLETED'
        ? 'Queda registrada como «Realizada» y habilita la decisión.'
        : 'Queda registrada como «No asistió».',
      { confirmLabel: 'Marcar', variant: 'warning' },
    );
    if (!ok) return;
    await this.store.update(
      (id) => this.api.completeInterview(id, { outcome }),
      outcome === 'COMPLETED'
        ? 'La entrevista quedó como realizada.'
        : 'La entrevista quedó como «No asistió».',
    );
  }

  protected async cancel(): Promise<void> {
    const note = this.cancelNote().trim();
    const done = await this.store.update(
      (id) => this.api.cancelInterview(id, note ? { note } : {}),
      'Se canceló la entrevista; la postulación volvió a «En revisión».',
    );
    if (done) {
      this.cancelling.set(false);
      this.cancelNote.set('');
    }
  }
}
