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
import { AdminApplicationsApi, ApplicationDecision, DecisionPreview } from 'data-access';
import { firstValueFrom } from 'rxjs';
import { Button, Dialog, DialogActions } from 'ui-kit';
import { percentRange } from '../../scholarship-types/scholarship-type-labels';
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
          @if (needsType()) {
            <fieldset class="adm-field">
              <legend class="adm-field__label">Tipo de beca a asignar</legend>
              <p class="adm-field__hint">
                Solicitó {{ requestedLabel() }}. Puedes asignar otro tipo de los que ofrece la
                oferta.
              </p>
              <div class="levels">
                @for (option of options(); track option.scholarshipTypeId) {
                  <label
                    class="level"
                    [class.level--active]="typeId() === option.scholarshipTypeId"
                    [class.level--full]="option.quota.isFull"
                  >
                    <input
                      type="radio"
                      name="scholarshipType"
                      [value]="option.scholarshipTypeId"
                      [attr.disabled]="option.quota.isFull ? '' : null"
                      [(ngModel)]="typeId"
                    />
                    <span class="level__name">{{ option.scholarshipType.name }}</span>
                    <span class="muted">
                      {{
                        range(option.scholarshipType.minPercent, option.scholarshipType.maxPercent)
                      }}
                      @if (option.balanceAtMaxPercent) {
                        · saldo {{ money(option.balanceAtMaxPercent) }}
                      }
                    </span>
                    <span class="muted" [class.mismatch]="option.quota.isFull">
                      @if (option.quota.isFull) {
                        Sin cupo: no se puede asignar
                      } @else if (option.quota.availableRecipients !== null) {
                        {{ option.quota.availableRecipients }}
                        {{
                          option.quota.availableRecipients === 1
                            ? 'cupo disponible'
                            : 'cupos disponibles'
                        }}
                      } @else {
                        Sin límite de cupo
                      }
                    </span>
                    @if (option.scholarshipType.requiresInterview) {
                      <span class="muted">Requiere entrevista realizada</span>
                    }
                    @if (!option.active) {
                      <span class="muted">Tipo desactivado</span>
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
            @if (p.assignedScholarshipType; as assigned) {
              <div>
                <dt>Beca</dt>
                <dd>
                  {{ assigned.name }}
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
                  : p.blockedReason === 'SCHOLARSHIP_TYPE_FULL'
                    ? 'Este tipo de beca ya no tiene cupo (global o de la oferta). Vuelve y elige otro.'
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
  protected readonly range = percentRange;
  protected readonly money = formatMoney;
  protected readonly formatDate = formatOfferDate;
  protected readonly textMax = TEXT_MAX;

  protected readonly typeId = signal<string | null>(null);
  protected readonly percent = signal<number | null>(null);
  protected readonly message = signal('');
  protected readonly note = signal('');
  protected readonly confirmed = signal(false);
  protected readonly preview = signal<DecisionPreview | null>(null);
  protected readonly loadingPreview = signal(false);

  private readonly app = this.store.application;
  protected readonly applicantName = computed(() => this.app()?.applicant.name ?? '');
  /** Tipos de beca habilitados en la oferta, con su cupo. */
  protected readonly options = computed(() => this.app()?.decision.scholarshipTypes ?? []);
  protected readonly needsType = computed(
    () => this.decision() === 'APPROVE' && this.app()?.kind === 'SCHOLARSHIP',
  );
  protected readonly requestedLabel = computed(() => {
    return this.app()?.requestedScholarshipType?.name ?? 'sin tipo de beca';
  });
  /** Rango del % (efectivo en la oferta) cuando el tipo elegido no tiene uno fijo. */
  protected readonly percentRange = computed(() => {
    const type = this.options().find((o) => o.scholarshipTypeId === this.typeId())?.scholarshipType;
    return type && type.minPercent !== type.maxPercent
      ? { min: type.minPercent, max: type.maxPercent }
      : null;
  });
  protected readonly formValid = computed(() => {
    if (!this.needsType()) return true;
    if (!this.typeId()) return false;
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
        // Se propone el ya asignado o el solicitado, si sigue disponible.
        const suggested =
          a?.decision.assignedScholarshipTypeId ?? a?.requestedScholarshipTypeId ?? null;
        const usable = this.options().some(
          (o) => o.scholarshipTypeId === suggested && !o.quota.isFull,
        );
        this.typeId.set(usable ? suggested : null);
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
    const typeId = this.needsType() ? (this.typeId() ?? undefined) : undefined;
    return {
      assignedScholarshipTypeId: typeId,
      assignedPercent: typeId && this.percentRange() ? (this.percent() ?? undefined) : undefined,
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
