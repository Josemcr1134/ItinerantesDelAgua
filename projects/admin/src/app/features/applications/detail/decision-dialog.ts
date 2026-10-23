import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AdminApplicationsApi,
  ApplicationDecision,
  DecisionPreview,
  ScholarshipLevel,
} from 'data-access';
import { firstValueFrom } from 'rxjs';
import { Button, Dialog, DialogActions } from 'ui-kit';
import { SCHOLARSHIP_LEVEL_LABELS } from '../../offers/offer-labels';
import { formatOfferDate } from '../../offers/shared/zoned-time';
import { APPLICATION_STATUS_LABELS } from '../application-labels';
import { formatMoney } from '../../../shared/format/format';
import { ApplicationStore } from './application-store';

const TEXT_MAX = 1000;

/**
 * Registrar la decisión (HU-31) en dos pasos: datos (nivel y % en becas,
 * párrafo del correo y nota interna) y vista previa del correo, que hay que
 * confirmar antes de guardar.
 */
@Component({
  selector: 'adm-decision-dialog',
  imports: [FormsModule, Button, Dialog, DialogActions],
  template: `
    <ui-dialog
      [(open)]="open"
      [title]="decision() === 'APPROVE' ? 'Aprobar postulación' : 'No seleccionar'"
      size="wide"
      [busy]="store.busy() || loadingPreview()"
    >
      @if (!preview()) {
        <form id="decision-form" class="form" (ngSubmit)="showPreview()">
          @if (needsLevel()) {
            <fieldset class="adm-field">
              <legend class="adm-field__label">Nivel de beca a asignar</legend>
              <p class="adm-field__hint">
                Solicitó {{ requestedLabel() }}. Puedes asignar otro nivel.
              </p>
              <div class="levels">
                @for (option of levels(); track option.level) {
                  <label class="level" [class.level--active]="level() === option.level">
                    <input type="radio" name="level" [value]="option.level" [(ngModel)]="level" />
                    <span class="level__name">{{ option.label }}</span>
                    <span class="muted">
                      {{
                        option.minPercent === option.maxPercent
                          ? option.maxPercent + '%'
                          : option.minPercent + '–' + option.maxPercent + '%'
                      }}
                      @if (option.balanceAtMaxPercent) {
                        · saldo {{ money(option.balanceAtMaxPercent) }}
                      }
                    </span>
                    @if (option.requiresInterview) {
                      <span class="muted">Requiere entrevista realizada</span>
                    }
                  </label>
                }
              </div>
            </fieldset>
            @if (percentRange(); as range) {
              <div class="adm-field percent">
                <label class="adm-field__label" for="decision-percent">Porcentaje de beca</label>
                <input
                  id="decision-percent"
                  class="adm-field__input"
                  type="number"
                  name="percent"
                  inputmode="numeric"
                  step="1"
                  [min]="range.min"
                  [max]="range.max"
                  [(ngModel)]="percent"
                  aria-describedby="decision-percent-hint"
                />
                <p id="decision-percent-hint" class="adm-field__hint">
                  Entero entre {{ range.min }} y {{ range.max }}.
                </p>
              </div>
            }
          }
          <div class="adm-field">
            <label class="adm-field__label" for="decision-message"
              >Párrafo para el postulante <span class="adm-field__hint">(opcional)</span></label
            >
            <textarea
              id="decision-message"
              class="adm-field__input"
              name="message"
              rows="3"
              [maxlength]="textMax"
              [(ngModel)]="message"
              aria-describedby="decision-message-hint"
            ></textarea>
            <p id="decision-message-hint" class="adm-field__hint">
              Se agrega al correo y a la notificación del portal.
            </p>
          </div>
          <div class="adm-field">
            <label class="adm-field__label" for="decision-note"
              >Nota interna <span class="adm-field__hint">(opcional, no la ve)</span></label
            >
            <textarea
              id="decision-note"
              class="adm-field__input"
              name="note"
              rows="2"
              [maxlength]="textMax"
              [(ngModel)]="note"
            ></textarea>
          </div>
        </form>
      } @else {
        @let p = preview()!;
        <div class="form">
          <dl class="summary">
            <div>
              <dt>Nuevo estado</dt>
              <dd>{{ statusLabels[p.status] }}</dd>
            </div>
            @if (p.assignedLevel) {
              <div>
                <dt>Nivel</dt>
                <dd>
                  {{ levelLabels[p.assignedLevel] }}
                  @if (p.assignedPercent !== null) {
                    ({{ p.assignedPercent }}%)
                  }
                </dd>
              </div>
            }
            @if (p.balance) {
              <div>
                <dt>Saldo a pagar</dt>
                <dd>{{ money(p.balance) }}</dd>
              </div>
            }
            @if (p.responseDueAt) {
              <div>
                <dt>Plazo para responder</dt>
                <dd>{{ formatDate(p.responseDueAt) }}</dd>
              </div>
            }
          </dl>
          @if (p.blockedReason) {
            <p class="adm-callout" role="alert">
              {{
                p.blockedReason === 'APPLICATION_INTERVIEW_REQUIRED'
                  ? 'Esta postulación requiere una entrevista por Zoom «Realizada» antes de aprobarse.'
                  : 'No se puede registrar esta decisión todavía.'
              }}
            </p>
          }
          <section class="email" aria-labelledby="decision-email-subject">
            <p class="muted">Correo que recibirá {{ applicantName() }}</p>
            <h3 id="decision-email-subject" class="email__subject">{{ p.email.subject }}</h3>
            <p class="email__body">{{ p.email.body }}</p>
          </section>
          @if (!p.blockedReason) {
            <label class="adm-check">
              <input type="checkbox" name="confirmed" [(ngModel)]="confirmed" />
              Revisé el correo y quiero registrar la decisión
            </label>
          }
        </div>
      }
      <div uiDialogActions>
        @if (!preview()) {
          <button uiButton variant="secondary" type="button" (click)="open.set(false)">
            Cancelar
          </button>
          <button
            uiButton
            type="submit"
            form="decision-form"
            [disabled]="!formValid() || loadingPreview()"
          >
            {{ loadingPreview() ? 'Preparando…' : 'Ver vista previa' }}
          </button>
        } @else {
          <button
            uiButton
            variant="secondary"
            type="button"
            [disabled]="store.busy()"
            (click)="preview.set(null)"
          >
            Volver
          </button>
          <button
            uiButton
            type="button"
            [disabled]="!confirmed() || !!preview()?.blockedReason || store.busy()"
            (click)="submit()"
          >
            {{ store.busy() ? 'Registrando…' : 'Registrar decisión' }}
          </button>
        }
      </div>
    </ui-dialog>
  `,
  styleUrl: './panels.scss',
})
export class DecisionDialog {
  readonly open = model(false);
  readonly decision = input.required<ApplicationDecision>();

  protected readonly store = inject(ApplicationStore);
  private readonly api = inject(AdminApplicationsApi);

  protected readonly statusLabels = APPLICATION_STATUS_LABELS;
  protected readonly levelLabels = SCHOLARSHIP_LEVEL_LABELS;
  protected readonly money = formatMoney;
  protected readonly formatDate = formatOfferDate;
  protected readonly textMax = TEXT_MAX;

  protected readonly level = signal<ScholarshipLevel | null>(null);
  protected readonly percent = signal<number | null>(null);
  protected readonly message = signal('');
  protected readonly note = signal('');
  protected readonly confirmed = signal(false);
  protected readonly preview = signal<DecisionPreview | null>(null);
  protected readonly loadingPreview = signal(false);

  private readonly app = this.store.application;
  protected readonly applicantName = computed(() => this.app()?.applicant.name ?? '');
  protected readonly levels = computed(() => this.app()?.decision.levels ?? []);
  protected readonly needsLevel = computed(
    () => this.decision() === 'APPROVE' && this.app()?.kind === 'SCHOLARSHIP',
  );
  protected readonly requestedLabel = computed(() => {
    const requested = this.app()?.requestedLevel;
    return requested ? this.levelLabels[requested] : 'sin nivel';
  });
  /** Rango del % cuando el nivel elegido no tiene uno fijo (Beca especial). */
  protected readonly percentRange = computed(() => {
    const option = this.levels().find((l) => l.level === this.level());
    return option && option.minPercent !== option.maxPercent
      ? { min: option.minPercent, max: option.maxPercent }
      : null;
  });
  protected readonly formValid = computed(() => {
    if (!this.needsLevel()) return true;
    if (!this.level()) return false;
    const range = this.percentRange();
    const percent = this.percent();
    return (
      !range ||
      (percent !== null &&
        Number.isInteger(percent) &&
        percent >= range.min &&
        percent <= range.max)
    );
  });

  constructor() {
    effect(() => {
      if (!this.open()) return;
      untracked(() => {
        const a = this.app();
        const suggested = a?.decision.assignedLevel ?? a?.requestedLevel ?? null;
        this.level.set(this.levels().some((l) => l.level === suggested) ? suggested : null);
        this.percent.set(a?.decision.assignedPercent ?? null);
        this.message.set('');
        this.note.set('');
        this.confirmed.set(false);
        this.preview.set(null);
      });
    });
  }

  /** Datos de la decisión tal como los esperan la vista previa y el registro. */
  private choice() {
    const level = this.needsLevel() ? (this.level() ?? undefined) : undefined;
    return {
      assignedLevel: level,
      assignedPercent: level && this.percentRange() ? (this.percent() ?? undefined) : undefined,
      message: this.message().trim() || undefined,
    };
  }

  protected async showPreview(): Promise<void> {
    if (!this.formValid()) return;
    this.loadingPreview.set(true);
    const preview = await this.store.run((id) =>
      firstValueFrom(this.api.decisionPreview(id, { decision: this.decision(), ...this.choice() })),
    );
    this.loadingPreview.set(false);
    if (preview) {
      this.confirmed.set(false);
      this.preview.set(preview);
    }
  }

  protected async submit(): Promise<void> {
    if (!this.confirmed()) return;
    const body = {
      ...this.choice(),
      note: this.note().trim() || undefined,
      emailPreviewConfirmed: true,
    };
    const name = this.applicantName();
    const done = await this.store.update(
      (id) =>
        this.decision() === 'APPROVE' ? this.api.approve(id, body) : this.api.reject(id, body),
      (detail) =>
        detail.decision.emailStatus === 'FAILED'
          ? 'Se registró la decisión, pero el correo no se envió. Puedes reintentarlo abajo.'
          : `Se registró la decisión y se avisó a ${name}.`,
    );
    if (done) this.open.set(false);
  }
}
