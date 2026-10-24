import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AdminApplicationsApi,
  EVALUATION_RECOMMENDATION_VALUES,
  EvaluationRecommendation,
} from 'data-access';
import { Button } from 'ui-kit';
import { percentRange } from '../../scholarship-types/scholarship-type-labels';
import { RECOMMENDATION_LABELS, RECOMMENDATION_TONES } from '../application-labels';
import { formatDateTime } from '../../../shared/format/format';
import { ApplicationStore } from './application-store';

const COMMENT_MAX = 2000;

/**
 * Evaluación del comité (HU-31): resumen, evaluaciones de cada integrante y
 * la mía (Aprobar / No seleccionar / Tengo dudas, nivel sugerido en becas y
 * comentario). Nunca la ve el postulante.
 */
@Component({
  selector: 'adm-evaluation-panel',
  imports: [FormsModule, Button],
  template: `
    @if (store.application(); as a) {
      <section class="adm-section" aria-labelledby="eval-title">
        <h2 id="eval-title" class="adm-section__title">Evaluación del comité</h2>
        <p class="adm-section__lead">
          {{ a.evaluationSummary.total ? a.evaluationSummary.label : 'Aún no hay evaluaciones.' }}
        </p>

        @if (others().length) {
          <ul class="evals">
            @for (e of others(); track e.id) {
              <li class="eval">
                <p class="eval__head">
                  <strong>{{ e.evaluator.fullName }}</strong>
                  <span [class]="'adm-badge adm-badge--' + tones[e.recommendation]">{{
                    labels[e.recommendation]
                  }}</span>
                </p>
                @if (e.suggestedScholarshipType; as suggested) {
                  <p class="muted">Beca sugerida: {{ suggested.name }}</p>
                }
                @if (e.comment) {
                  <p class="eval__comment">{{ e.comment }}</p>
                }
                <p class="muted">{{ formatDateTime(e.updatedAt) }}</p>
              </li>
            }
          </ul>
        }

        @if (store.canEvaluate()) {
          <form class="mine" (ngSubmit)="save()">
            <fieldset class="adm-field">
              <legend class="adm-field__label">Mi evaluación</legend>
              <div class="choices">
                @for (value of recommendations; track value) {
                  <label class="adm-check">
                    <input
                      type="radio"
                      name="recommendation"
                      [value]="value"
                      [(ngModel)]="recommendation"
                    />
                    {{ labels[value] }}
                  </label>
                }
              </div>
            </fieldset>
            @if (scholarshipTypes().length) {
              <div class="adm-field">
                <label class="adm-field__label" for="eval-scholarship"
                  >Beca sugerida <span class="adm-field__hint">(opcional)</span></label
                >
                <select
                  id="eval-scholarship"
                  class="adm-field__input"
                  name="scholarshipType"
                  [(ngModel)]="scholarshipTypeId"
                >
                  <option value="">Sin sugerir</option>
                  @for (option of scholarshipTypes(); track option.scholarshipTypeId) {
                    <option [value]="option.scholarshipTypeId">
                      {{ option.scholarshipType.name }} ({{
                        range(option.scholarshipType.minPercent, option.scholarshipType.maxPercent)
                      }}){{ option.quota.isFull ? ' · sin cupo' : '' }}
                    </option>
                  }
                </select>
              </div>
            }
            <div class="adm-field">
              <label class="adm-field__label" for="eval-comment"
                >Comentario <span class="adm-field__hint">(opcional, interno)</span></label
              >
              <textarea
                id="eval-comment"
                class="adm-field__input"
                name="comment"
                rows="4"
                [maxlength]="commentMax"
                [(ngModel)]="comment"
              ></textarea>
            </div>
            <button
              uiButton
              type="submit"
              class="submit"
              [disabled]="!recommendation() || store.busy()"
            >
              {{ mine() ? 'Actualizar mi evaluación' : 'Guardar mi evaluación' }}
            </button>
          </form>
        } @else if (mine(); as m) {
          <p class="muted">
            Tu evaluación: {{ labels[m.recommendation] }}. Ya no se puede cambiar en este estado.
          </p>
        }
      </section>
    }
  `,
  styleUrl: './panels.scss',
})
export class EvaluationPanel {
  protected readonly store = inject(ApplicationStore);
  private readonly api = inject(AdminApplicationsApi);

  protected readonly labels = RECOMMENDATION_LABELS;
  protected readonly tones = RECOMMENDATION_TONES;
  protected readonly range = percentRange;
  protected readonly recommendations = EVALUATION_RECOMMENDATION_VALUES;
  protected readonly formatDateTime = formatDateTime;
  protected readonly commentMax = COMMENT_MAX;

  protected readonly mine = computed(() => this.store.application()?.myEvaluationDetail ?? null);
  /** Las de los demás integrantes (la mía va en el formulario). */
  protected readonly others = computed(() => {
    const a = this.store.application();
    const mineId = this.mine()?.id;
    return (a?.evaluations ?? []).filter((e) => e.id !== mineId || !this.store.canEvaluate());
  });
  /** Tipos de beca habilitados en la oferta (solo becas). */
  protected readonly scholarshipTypes = computed(() => {
    const a = this.store.application();
    return a?.kind === 'SCHOLARSHIP' ? a.decision.scholarshipTypes : [];
  });

  protected readonly recommendation = signal<EvaluationRecommendation | null>(null);
  protected readonly scholarshipTypeId = signal('');
  protected readonly comment = signal('');

  constructor() {
    // Al cambiar de postulación (o al guardar), el formulario muestra mi evaluación.
    effect(() => {
      const mine = this.mine();
      untracked(() => {
        this.recommendation.set(mine?.recommendation ?? null);
        this.scholarshipTypeId.set(mine?.suggestedScholarshipTypeId ?? '');
        this.comment.set(mine?.comment ?? '');
      });
    });
  }

  protected save(): Promise<unknown> {
    const recommendation = this.recommendation();
    if (!recommendation) return Promise.resolve();
    const body = {
      recommendation,
      suggestedScholarshipTypeId: this.scholarshipTypes().length
        ? this.scholarshipTypeId() || null
        : undefined,
      comment: this.comment().trim() || null,
    };
    return this.store.update(
      (id) => this.api.evaluate(id, body),
      'Se guardó tu evaluación. El postulante no la ve.',
    );
  }
}
