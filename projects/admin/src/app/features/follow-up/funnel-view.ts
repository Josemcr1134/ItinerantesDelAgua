import { Component, computed, input } from '@angular/core';
import { OfferFunnelDto } from 'data-access';

/** Embudo de conversión (Postulados → Aprobados → Con pago iniciado → Inscritos) y su resumen. */
@Component({
  selector: 'adm-funnel-view',
  template: `
    @let f = funnel();
    <section class="adm-section" aria-labelledby="funnel-title">
      <div class="head">
        <h2 id="funnel-title" class="adm-section__title">Embudo de conversión</h2>
        <p class="conversion">
          <span class="conversion__value">{{ f.conversionPercent }}%</span>
          <span class="muted">de postulados a inscritos</span>
        </p>
      </div>
      <ol class="stages">
        @for (stage of f.stages; track stage.key; let first = $first) {
          <li class="stage">
            <div class="stage__label">
              <span class="stage__name">{{ stage.label }}</span>
              <span class="stage__count">{{ stage.count }}</span>
            </div>
            <div class="bar" aria-hidden="true">
              <span class="bar__fill" [style.width.%]="width(stage.count)"></span>
            </div>
            @if (!first) {
              <p class="muted">
                {{ stage.percentOfPrevious }}% de la etapa anterior · {{ stage.percentOfApplied }}%
                de los postulados
              </p>
            }
          </li>
        }
      </ol>
      @if (f.directEnrollments) {
        <p class="muted direct">
          Además, {{ f.directEnrollments }}
          {{ f.directEnrollments === 1 ? 'inscripción' : 'inscripciones' }} sin postulación (pago
          directo, Moodle o gratuitas).
        </p>
      }
    </section>

    <ul class="cards" aria-label="Resumen de postulaciones">
      <li class="card" [class.card--alert]="f.dueSoon">
        <span class="card__value">{{ f.dueSoon }}</span>
        <span class="card__label">Vencen en 2 días o menos</span>
      </li>
      <li class="card">
        <span class="card__value">{{ f.pendingPayment }}</span>
        <span class="card__label">Pendientes de pago</span>
      </li>
      <li class="card">
        <span class="card__value">{{ f.pendingConfirmation }}</span>
        <span class="card__label">Pendientes de confirmar</span>
      </li>
      <li class="card">
        <span class="card__value">{{ f.inReview }}</span>
        <span class="card__label">En revisión</span>
      </li>
      <li class="card">
        <span class="card__value">{{ f.expired }}</span>
        <span class="card__label">Vencidas</span>
      </li>
      <li class="card">
        <span class="card__value">{{ f.notSelected }}</span>
        <span class="card__label">No seleccionadas</span>
      </li>
    </ul>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--space-4);
    }
    p {
      margin: 0;
    }
    .head {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--space-2) var(--space-4);
    }
    .conversion {
      display: flex;
      align-items: baseline;
      gap: var(--space-2);
    }
    .conversion__value {
      color: var(--color-primary);
      font-family: var(--font-family-numeric);
      font-size: 1.75rem;
      font-weight: 700;
    }
    .muted {
      color: color-mix(in srgb, var(--color-raisin-black) 65%, transparent);
      font-size: 0.8125rem;
    }
    .stages {
      display: grid;
      gap: var(--space-3);
      margin: var(--space-2) 0 0;
      padding: 0;
      list-style: none;
    }
    .stage__label {
      display: flex;
      justify-content: space-between;
      gap: var(--space-2);
      margin-bottom: 4px;
      font-weight: 700;
    }
    .stage__count {
      font-family: var(--font-family-numeric);
    }
    .bar {
      height: 12px;
      overflow: hidden;
      border-radius: var(--radius-pill);
      background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
    }
    .bar__fill {
      display: block;
      height: 100%;
      border-radius: inherit;
      background-color: var(--color-primary);
    }
    .direct {
      margin-top: var(--space-3);
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 10rem), 1fr));
      gap: var(--space-3);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .card {
      display: grid;
      gap: 2px;
      padding: var(--space-3);
      border-radius: 16px;
      background-color: var(--color-surface);
    }
    .card--alert {
      border-left: 4px solid var(--color-danger);
    }
    .card__value {
      font-family: var(--font-family-numeric);
      font-size: 1.5rem;
      font-weight: 700;
    }
    .card__label {
      color: color-mix(in srgb, var(--color-raisin-black) 70%, transparent);
      font-size: 0.8125rem;
    }
  `,
})
export class FunnelView {
  readonly funnel = input.required<OfferFunnelDto>();

  /** Ancho de cada barra respecto a la primera etapa (postulados). */
  private readonly base = computed(() => Math.max(1, this.funnel().stages[0]?.count ?? 0));
  protected width(count: number): number {
    return Math.round((count / this.base()) * 100);
  }
}
