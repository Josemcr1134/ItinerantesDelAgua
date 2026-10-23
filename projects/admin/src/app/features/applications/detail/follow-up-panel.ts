import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AdminFollowUpApi,
  FOLLOW_UP_OUTCOME_VALUES,
  FollowUpDetailDto,
  FollowUpOutcome,
  requestState,
} from 'data-access';
import { firstValueFrom } from 'rxjs';
import { Dialog, DialogActions } from 'ui-kit';
import { FormActions } from '../../../shared/form-actions/form-actions';
import { RequestState } from '../../../shared/request-state/request-state';
import { isoToZonedInput, zonedInputToIso } from '../../offers/shared/zoned-time';
import { FOLLOW_UP_OUTCOME_LABELS } from '../application-labels';
import { formatDateTime, formatMoney } from '../../../shared/format/format';
import { FollowUpActions } from '../follow-up-actions';
import { ApplicationStore } from './application-store';

const TEXT_MAX = 1000;

/**
 * Seguimiento de una postulación aprobada (HU-32): saldo, plazo, último
 * contacto y línea de tiempo; recordatorio por correo (uno cada 24 h),
 * WhatsApp (enlace prellenado), notas internas y extensión del plazo.
 */
@Component({
  selector: 'adm-follow-up-panel',
  imports: [FormsModule, Dialog, DialogActions, FormActions, RequestState],
  template: `
    <section class="adm-section" aria-labelledby="follow-up-title">
      <h2 id="follow-up-title" class="adm-section__title">Seguimiento</h2>
      <adm-request-state
        [error]="followUp.error()"
        [loaded]="followUp.data() !== null"
        loadingText="Cargando seguimiento…"
        (retry)="load()"
      >
        @if (followUp.data(); as f) {
          <dl class="summary">
            @if (f.balance) {
              <div>
                <dt>Saldo</dt>
                <dd>{{ money(f.balance) }}</dd>
              </div>
            }
            @if (f.responseDueAt) {
              <div>
                <dt>Plazo</dt>
                <dd [class.due-soon]="f.dueSoon">
                  {{ formatDateTime(f.responseDueAt) }}
                  @if (f.remainingDays !== null) {
                    <span class="muted">· {{ remaining(f.remainingDays) }}</span>
                  }
                </dd>
              </div>
            }
            <div>
              <dt>Último contacto</dt>
              <dd>
                {{ f.lastContactAt ? formatDateTime(f.lastContactAt) : 'Sin contacto' }}
                @if (f.lastOutcome) {
                  · {{ outcomeLabels[f.lastOutcome] }}
                }
              </dd>
            </div>
          </dl>
          @if (f.pendingTransfer || f.paymentStarted) {
            <ul class="adm-chips">
              @if (f.pendingTransfer) {
                <li class="adm-chip">Transferencia por validar</li>
              }
              @if (f.paymentStarted) {
                <li class="adm-chip">Con pago iniciado</li>
              }
            </ul>
          }

          @if (store.canManageFollowUp()) {
            <div class="adm-actions panel-actions">
              @if (canRemindStatus(f)) {
                <button
                  type="button"
                  class="adm-action"
                  [disabled]="!f.canRemind || store.busy()"
                  (click)="remind()"
                >
                  Enviar recordatorio
                </button>
              }
              <button
                type="button"
                class="adm-action"
                [disabled]="!f.phone.whatsappUrl || store.busy()"
                (click)="whatsapp()"
              >
                WhatsApp<span class="visually-hidden"> (se abre en otra pestaña)</span>
              </button>
              <button
                type="button"
                class="adm-action"
                [disabled]="store.busy()"
                (click)="noting.set(true)"
              >
                Agregar nota
              </button>
              @if (f.status !== 'ENROLLED') {
                <button
                  type="button"
                  class="adm-action"
                  [disabled]="store.busy()"
                  (click)="openExtend(f)"
                >
                  Extender plazo
                </button>
              }
            </div>
            @if (canRemindStatus(f) && !f.canRemind && f.remindAvailableAt) {
              <p class="muted">
                Próximo recordatorio disponible: {{ formatDateTime(f.remindAvailableAt) }}
              </p>
            }
            @if (!f.phone.whatsappUrl) {
              <p class="muted">Sin teléfono válido con indicativo para WhatsApp.</p>
            }
          }

          @if (f.timeline.length) {
            <h3 class="panel-sub">Línea de tiempo</h3>
            <ol class="plain feed">
              @for (item of f.timeline; track $index) {
                <li class="feed__item">
                  <p class="feed__title">
                    {{ item.title }}
                    @if (item.outcome) {
                      <span class="adm-chip">{{ outcomeLabels[item.outcome] }}</span>
                    }
                  </p>
                  @if (item.detail) {
                    <p class="feed__detail">{{ item.detail }}</p>
                  }
                  <p class="muted">
                    {{ formatDateTime(item.at) }}
                    @if (item.author) {
                      · {{ item.author.fullName }}
                    }
                  </p>
                </li>
              }
            </ol>
          }
        }
      </adm-request-state>
    </section>

    @if (store.canManageFollowUp()) {
      <ui-dialog [(open)]="noting" title="Agregar nota" [busy]="store.busy()">
        <form id="note-form" class="form" (ngSubmit)="addNote()">
          <div class="adm-field">
            <label class="adm-field__label" for="note-body">Nota interna</label>
            <textarea
              id="note-body"
              class="adm-field__input"
              name="body"
              rows="4"
              required
              [maxlength]="textMax"
              [(ngModel)]="noteBody"
            ></textarea>
            <p class="adm-field__hint">El postulante no la ve.</p>
          </div>
          <div class="adm-field">
            <label class="adm-field__label" for="note-outcome"
              >Resultado <span class="adm-field__hint">(opcional)</span></label
            >
            <select
              id="note-outcome"
              class="adm-field__input"
              name="outcome"
              [(ngModel)]="noteOutcome"
            >
              <option value="">Sin resultado</option>
              @for (o of outcomes; track o) {
                <option [value]="o">{{ outcomeLabels[o] }}</option>
              }
            </select>
          </div>
        </form>
        <div uiDialogActions>
          <adm-form-actions
            form="note-form"
            submitLabel="Guardar nota"
            [busy]="store.busy()"
            (cancel)="noting.set(false)"
          />
        </div>
      </ui-dialog>

      <ui-dialog [(open)]="extending" title="Extender plazo" [busy]="store.busy()">
        <form id="extend-form" class="form" (ngSubmit)="extend()">
          <div class="adm-field">
            <label class="adm-field__label" for="extend-date">Nueva fecha límite</label>
            <input
              id="extend-date"
              class="adm-field__input"
              type="datetime-local"
              name="dueAt"
              required
              [(ngModel)]="extendAt"
            />
            <p class="adm-field__hint">
              Hora del centro de México. Debe ser futura y no pasar del inicio de clases. Si estaba
              vencida, se reactiva.
            </p>
          </div>
          <div class="adm-field">
            <label class="adm-field__label" for="extend-reason">Motivo</label>
            <textarea
              id="extend-reason"
              class="adm-field__input"
              name="reason"
              rows="3"
              required
              [maxlength]="textMax"
              [(ngModel)]="extendReason"
            ></textarea>
          </div>
        </form>
        <div uiDialogActions>
          <adm-form-actions
            form="extend-form"
            submitLabel="Extender plazo"
            [busy]="store.busy()"
            (cancel)="extending.set(false)"
          />
        </div>
      </ui-dialog>
    }
  `,
  styleUrl: './panels.scss',
})
export class FollowUpPanel {
  protected readonly store = inject(ApplicationStore);
  private readonly api = inject(AdminFollowUpApi);
  private readonly actions = inject(FollowUpActions);

  protected readonly followUp = requestState<FollowUpDetailDto>();
  protected readonly outcomeLabels = FOLLOW_UP_OUTCOME_LABELS;
  protected readonly outcomes = FOLLOW_UP_OUTCOME_VALUES;
  protected readonly money = formatMoney;
  protected readonly formatDateTime = formatDateTime;
  protected readonly textMax = TEXT_MAX;

  protected readonly noting = signal(false);
  protected readonly noteBody = signal('');
  protected readonly noteOutcome = signal<FollowUpOutcome | ''>('');
  protected readonly extending = signal(false);
  protected readonly extendAt = signal('');
  protected readonly extendReason = signal('');

  /** Se recarga al cambiar de postulación o de estado. */
  private readonly key = computed(() => {
    const a = this.store.application();
    return a ? `${a.id}:${a.status}` : null;
  });

  constructor() {
    effect(() => {
      if (this.key()) untracked(() => this.load());
    });
  }

  protected load(): void {
    const id = this.store.application()?.id;
    if (id) void this.followUp.run(this.api.detail(id));
  }

  /** El recordatorio solo aplica a aprobadas pendientes de pago o confirmación. */
  protected canRemindStatus(f: FollowUpDetailDto): boolean {
    return f.status === 'APPROVED_PENDING_PAYMENT' || f.status === 'APPROVED_PENDING_CONFIRMATION';
  }

  protected remaining(days: number): string {
    if (days < 0) return `venció hace ${-days} ${-days === 1 ? 'día' : 'días'}`;
    if (days === 0) return 'vence hoy';
    return `${days} ${days === 1 ? 'día' : 'días'} restantes`;
  }

  protected async remind(): Promise<void> {
    const message = await this.store.run((id) => this.actions.remind(id));
    if (!message) return;
    this.store.notice.set(message);
    this.load();
  }

  protected async whatsapp(): Promise<void> {
    const message = await this.store.run((id) => this.actions.whatsapp(id));
    if (!message) return;
    this.store.notice.set(message);
    this.load();
  }

  protected async addNote(): Promise<void> {
    const body = this.noteBody().trim();
    if (!body) return;
    const outcome = this.noteOutcome() || undefined;
    const note = await this.store.run((id) =>
      firstValueFrom(this.api.addNote(id, { body, outcome })),
    );
    if (!note) return;
    this.noting.set(false);
    this.noteBody.set('');
    this.noteOutcome.set('');
    this.store.notice.set('Se guardó la nota.');
    this.load();
  }

  protected openExtend(f: FollowUpDetailDto): void {
    this.extendAt.set(isoToZonedInput(f.responseDueAt));
    this.extendReason.set('');
    this.extending.set(true);
  }

  protected async extend(): Promise<void> {
    const responseDueAt = zonedInputToIso(this.extendAt());
    const reason = this.extendReason().trim();
    if (!responseDueAt || !reason) return;
    const updated = await this.store.run((id) =>
      firstValueFrom(this.api.extendDeadline(id, { responseDueAt, reason })),
    );
    if (!updated) return;
    this.extending.set(false);
    this.followUp.set(updated);
    this.store.notice.set(`Se extendió el plazo al ${formatDateTime(updated.responseDueAt)}.`);
    // Si estaba vencida, cambió de estado.
    await this.store.refresh();
  }
}
