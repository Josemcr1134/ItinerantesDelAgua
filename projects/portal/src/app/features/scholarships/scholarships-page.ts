import { Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SessionStore } from 'auth';
import {
  APPLICATION_STATUS_VALUES,
  ApplicationOpportunityDto,
  ApplicationsApi,
  ApplicationStatus,
  toApiError,
} from 'data-access';
import { firstValueFrom } from 'rxjs';
import { AlertService } from 'ui-kit';
import { usePageHeading } from '../../core/page-heading/page-heading';
import { APPLICATION_STATUS_LABELS } from '../../shared/applications/application-labels';
import { OpportunityCard } from '../../shared/applications/opportunity-card/opportunity-card';
import { browserTimezone } from '../dashboard/dashboard-format';
import { CLOSED_STATUSES, STATUS_TONES } from './scholarship-format';
import { ScholarshipTracker } from './scholarship-tracker/scholarship-tracker';

/**
 * Becas (Figma): "Becas disponibles" para postular y "Mis postulaciones" con
 * el seguimiento de cada una y, abajo, las cerradas en una tabla. Se postula
 * desde aquí mientras no exista el catálogo; el formulario está en /becas/:id.
 */
@Component({
  selector: 'portal-scholarships-page',
  imports: [RouterLink, OpportunityCard, ScholarshipTracker],
  templateUrl: './scholarships-page.html',
  styleUrls: [
    './scholarships-page.scss',
    './scholarships-history.scss',
    './scholarship-badge.scss',
  ],
})
export default class ScholarshipsPage {
  private readonly api = inject(ApplicationsApi);
  private readonly alerts = inject(AlertService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly user = inject(SessionStore).user;

  /** Pestaña (`?pestana=postulaciones`); por defecto, las becas disponibles. */
  readonly pestana = input<string>();
  /** Filtro de "Mis postulaciones" (`?estado=`). */
  readonly estado = input<string>();

  protected readonly statuses = APPLICATION_STATUS_LABELS;
  protected readonly tones = STATUS_TONES;
  protected readonly timezone = computed(() => this.user()?.timezone ?? browserTimezone());
  protected readonly tab = computed(() => (this.pestana() === 'postulaciones' ? 'mine' : 'open'));
  protected readonly creating = signal<string | null>(null);

  protected readonly opportunities = rxResource({
    params: () => (this.tab() === 'open' ? 'SCHOLARSHIP' : undefined),
    stream: () => this.api.opportunities({ kind: 'SCHOLARSHIP' }),
  });
  /** Siempre se pide: da el total de la pestaña. */
  protected readonly mine = rxResource({
    stream: () => this.api.list({ kind: 'SCHOLARSHIP', pageSize: 50 }),
  });

  /** Respuestas cargadas (`value()` lanza si la petición falló). */
  protected readonly available = computed(() =>
    this.opportunities.hasValue() ? this.opportunities.value() : undefined,
  );
  protected readonly mineResponse = computed(() =>
    this.mine.hasValue() ? this.mine.value() : undefined,
  );
  protected readonly mineCount = computed(() => this.mineResponse()?.meta.total ?? 0);
  /** Estados presentes, en el orden del proceso, para el filtro. */
  protected readonly filterOptions = computed(() => {
    const present = new Set(this.mineResponse()?.data.map((a) => a.status));
    return APPLICATION_STATUS_VALUES.filter((status) => present.has(status));
  });
  protected readonly filter = computed(() => {
    const value = this.estado() as ApplicationStatus | undefined;
    return value && APPLICATION_STATUS_VALUES.includes(value) ? value : '';
  });
  private readonly filtered = computed(() => {
    const filter = this.filter();
    const list = this.mineResponse()?.data ?? [];
    return filter ? list.filter((a) => a.status === filter) : list;
  });
  protected readonly active = computed(() =>
    this.filtered().filter((a) => !CLOSED_STATUSES.includes(a.status)),
  );
  protected readonly closed = computed(() =>
    this.filtered().filter((a) => CLOSED_STATUSES.includes(a.status)),
  );
  protected readonly error = computed(() => {
    const error = this.opportunities.error() ?? this.mine.error();
    return error ? toApiError(error).message : null;
  });

  constructor() {
    usePageHeading().set({ title: 'Becas' });
  }

  protected setFilter(value: string): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { estado: value || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  /** [Postularme]: crea el borrador (o abre el que ya existía) y va al formulario. */
  protected async apply(opportunity: ApplicationOpportunityDto): Promise<void> {
    this.creating.set(opportunity.offer.id);
    try {
      const created = await firstValueFrom(this.api.create({ offerId: opportunity.offer.id }));
      this.open(created.id);
    } catch (error) {
      const apiError = toApiError(error);
      const existing = apiError.metaString('applicationId');
      if (apiError.code === 'APPLICATION_ALREADY_EXISTS' && existing) this.open(existing);
      else await this.alerts.error('No se pudo iniciar la postulación', apiError.message);
    } finally {
      this.creating.set(null);
    }
  }

  protected open(applicationId: string): void {
    void this.router.navigate(['/becas', applicationId]);
  }

  protected onChanged(): void {
    this.mine.reload();
  }
}
