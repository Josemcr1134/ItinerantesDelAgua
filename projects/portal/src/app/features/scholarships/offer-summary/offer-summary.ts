import { Component, computed, input } from '@angular/core';
import { ApplicationDetailDto, OfferScheduleDto } from 'data-access';
import {
  dateIn,
  dateRange,
  formatAmountRange,
  formatMoney,
  percentLabel,
} from '../../../shared/applications/application-format';
import { localScheduleLabel, scheduleLabel } from '../scholarship-format';

/**
 * Columna del formulario de beca (Figma): resumen de la oferta (cohorte,
 * horario en CDMX y en la zona de la persona, costo), lo que pagaría con el
 * nivel elegido, cierre de la convocatoria, cupo y los pasos del proceso.
 */
@Component({
  selector: 'portal-offer-summary',
  template: `
    @let a = application();
    <section class="card" aria-labelledby="offer-summary-title">
      <h2 id="offer-summary-title" class="card__label">Resumen de la oferta</h2>
      <p class="card__name">{{ a.offer.name }}</p>
      @if (cohort()) {
        <p class="card__line">{{ cohort() }}</p>
      }
      @if (cdmxSchedule(); as cdmx) {
        <p class="card__line">{{ cdmx }}</p>
        @if (localSchedule(); as local) {
          <p class="card__line card__line--muted">En tu zona: {{ local }}</p>
        }
      }
      @if (a.form.price; as price) {
        <p class="card__cost">
          <span>Costo total (según tu país)</span>
          <strong>{{ money(price) }}</strong>
        </p>
      }

      <div class="estimate" aria-live="polite">
        @if (selected(); as option) {
          <p class="estimate__level">
            Nivel: {{ option.scholarshipType.name }} {{ percent(option.scholarshipType) }}
          </p>
          @if (option.estimatedBalance; as balance) {
            <p class="estimate__label">Pagarías aprox.</p>
            <p class="estimate__amount">{{ range(balance) }}</p>
          }
          <p class="estimate__note">El nivel final lo asigna el equipo.</p>
        } @else {
          <p class="estimate__note">Elige un nivel de beca para ver cuánto pagarías.</p>
        }
      </div>

      @if (a.form.window.closesAt; as closesAt) {
        <p class="card__line card__line--muted">
          Convocatoria de becas cierra el {{ date(closesAt) }}
        </p>
      }
      @if (available() !== null) {
        <p class="chip">
          {{ available() }} {{ available() === 1 ? 'beca disponible' : 'becas disponibles' }}
        </p>
      }
    </section>

    <!-- TODO(contenido): confirmar los pasos del proceso (Figma). -->
    <section class="card" aria-labelledby="process-title">
      <h2 id="process-title" class="card__label">Proceso</h2>
      <ol class="process">
        <li>Envías tu postulación</li>
        <li>Revisión en equipo</li>
        @if (interviewTypes()) {
          <li>Entrevista (solo {{ interviewTypes() }})</li>
        }
        <li>Resultado por correo</li>
      </ol>
    </section>
  `,
  styleUrl: './offer-summary.scss',
})
export class OfferSummary {
  readonly application = input.required<ApplicationDetailDto>();
  readonly schedule = input<OfferScheduleDto | null>(null);
  readonly selectedTypeId = input<string | null>(null);
  readonly timezone = input.required<string>();

  protected readonly money = formatMoney;
  protected readonly range = formatAmountRange;
  protected readonly percent = percentLabel;

  protected readonly cohort = computed(() => {
    const offer = this.application().offer;
    const dates = dateRange(offer.startsAt, offer.endsAt, this.timezone());
    return [offer.cohortLabel && `Cohorte ${offer.cohortLabel}`, dates].filter(Boolean).join(' · ');
  });
  protected readonly cdmxSchedule = computed(() => {
    const schedule = this.schedule();
    return schedule ? scheduleLabel(schedule) : null;
  });
  protected readonly localSchedule = computed(() => {
    const schedule = this.schedule();
    return schedule ? localScheduleLabel(schedule, this.timezone()) : null;
  });
  protected readonly selected = computed(
    () =>
      this.application().form.scholarshipTypes.find(
        (t) => t.scholarshipTypeId === this.selectedTypeId(),
      ) ?? null,
  );
  /** Becas por asignar en la oferta (null si algún tipo no tiene límite). */
  protected readonly available = computed(() => {
    const types = this.application().form.scholarshipTypes;
    if (!types.length || types.some((t) => t.availableRecipients === null)) return null;
    return types.reduce((sum, t) => sum + (t.availableRecipients ?? 0), 0);
  });
  /** "Beca especial" (los tipos que piden entrevista). */
  protected readonly interviewTypes = computed(() =>
    this.application()
      .form.scholarshipTypes.filter((t) => t.scholarshipType.requiresInterview)
      .map((t) => t.scholarshipType.name)
      .join(', '),
  );

  protected date(iso: string): string {
    return dateIn(iso, this.timezone());
  }
}
