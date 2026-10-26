import { SlicePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { ApplicationOpportunityDto } from 'data-access';
import {
  APPLICATION_STATUS_LABELS,
  MODALITY_LABELS,
  WINDOW_REASON_LABELS,
} from '../../../shared/applications/application-labels';
import { dateRange, dateTimeIn, formatMoney } from '../open-call-format';

/**
 * Tarjeta de una convocatoria (Figma HU-20): modalidad y elegibilidad,
 * nombre, fechas y sede, cierre en la zona de la persona y [Ver y postular]
 * (o [Ver mi postulación] si ya existe).
 */
@Component({
  selector: 'portal-opportunity-card',
  imports: [SlicePipe],
  template: `
    @let o = opportunity();
    <article
      class="card"
      [class.card--selected]="selected()"
      [attr.aria-labelledby]="'call-' + o.offer.id"
    >
      <p class="card__pills">
        <span class="pill">{{ modality() }}</span>
        @if (o.eligibility?.text; as text) {
          <!-- Recortada para no saltar de fila; el texto completo, en el tooltip. -->
          <span
            class="pill pill--eligibility"
            tabindex="0"
            [attr.aria-label]="'Elegibilidad: ' + text"
          >
            {{ text.length > maxChip ? (text | slice: 0 : maxChip).trimEnd() + '…' : text }}
            @if (text.length > maxChip) {
              <span class="tooltip" role="tooltip" aria-hidden="true">{{ text }}</span>
            }
          </span>
        }
      </p>
      <h2 class="card__title" [id]="'call-' + o.offer.id">{{ o.offer.name }}</h2>
      @if (o.offer.cohortLabel) {
        <p class="card__line">{{ o.offer.cohortLabel }}</p>
      }
      <p class="card__line">{{ when() }} · Sede: {{ o.offer.venue?.name ?? 'por definir' }}</p>
      <p class="card__line">{{ o.price ? money(o.price) : 'Gratuito' }}</p>

      <div class="card__footer">
        <p class="card__close">
          @switch (o.window.state) {
            @case ('OPEN') {
              @if (o.window.closesAt) {
                Cierra: <strong>{{ format(o.window.closesAt) }}</strong> (tu zona horaria)
              }
            }
            @case ('UPCOMING') {
              @if (o.window.opensAt) {
                Abre: <strong>{{ format(o.window.opensAt) }}</strong> (tu zona horaria)
              } @else {
                Próximamente
              }
            }
            @default {
              {{ o.window.reason ? reasons[o.window.reason] : 'Convocatoria cerrada' }}
            }
          }
        </p>
        @if (o.myApplication; as mine) {
          <button type="button" class="card__action" (click)="selectedApplication.emit(mine.id)">
            Ver mi postulación
          </button>
        } @else if (o.canApply) {
          <button type="button" class="card__action" [disabled]="busy()" (click)="apply.emit(o)">
            Ver y postular
          </button>
        } @else if (o.enrolled) {
          <span class="card__state">Ya tienes inscripción</span>
        }
      </div>
      @if (o.myApplication; as mine) {
        <p class="card__mine">Mi postulación: {{ statuses[mine.status] }}</p>
      }
    </article>
  `,
  styleUrl: './opportunity-card.scss',
})
export class OpportunityCard {
  readonly opportunity = input.required<ApplicationOpportunityDto>();
  readonly timezone = input.required<string>();
  readonly selected = input(false);
  readonly busy = input(false);
  readonly apply = output<ApplicationOpportunityDto>();
  readonly selectedApplication = output<string>();

  /** Caracteres visibles de la pastilla de elegibilidad. */
  protected readonly maxChip = 32;
  protected readonly reasons = WINDOW_REASON_LABELS;
  protected readonly statuses = APPLICATION_STATUS_LABELS;
  protected readonly money = formatMoney;
  protected readonly modality = computed(() => MODALITY_LABELS[this.opportunity().offer.modality]);
  protected readonly when = computed(() => {
    const offer = this.opportunity().offer;
    return dateRange(offer.startsAt, offer.endsAt, this.timezone()) ?? 'Fechas por definir';
  });

  protected format(iso: string): string {
    return dateTimeIn(iso, this.timezone());
  }
}
