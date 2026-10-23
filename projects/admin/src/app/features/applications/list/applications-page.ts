import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  AdminApplicationListItemDto,
  AdminApplicationsApi,
  AdminApplicationsQuery,
  ApplicationKind,
  ApplicationSort,
  CatalogsApi,
  SCHOLARSHIP_LEVEL_VALUES,
  ScholarshipLevel,
  SUBMITTED_APPLICATION_STATUS_VALUES,
  SubmittedApplicationStatus,
} from 'data-access';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { Button } from 'ui-kit';
import { AdminAccess } from '../../../core/access/admin-access';
import { saveFile } from '../../../core/download';
import { ErrorPresenter } from '../../../core/error-presenter';
import { FilterBar } from '../../../shared/filters/filter-bar';
import { FilterOption, FilterSelect, optionsFrom } from '../../../shared/filters/filter-select';
import { offerOptions } from '../../../shared/filters/offer-options';
import { SearchField } from '../../../shared/filters/search-field';
import { listController } from '../../../shared/list/list-controller';
import { ListStates } from '../../../shared/list/list-states';
import { Pagination } from '../../../shared/list/pagination';
import { PageHeader } from '../../../shared/page-header/page-header';
import { Person } from '../../../shared/person/person';
import { SCHOLARSHIP_LEVEL_LABELS } from '../../offers/offer-labels';
import { formatOfferDate } from '../../offers/shared/zoned-time';
import {
  APPLICATION_KIND_LABELS,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_TONES,
  RECOMMENDATION_LABELS,
} from '../application-labels';
import { formatDateTime } from '../../../shared/format/format';

/** Pestaña en la URL (`?tipo=`), para volver del detalle a la misma. */
const KIND_PARAMS: Readonly<Record<ApplicationKind, string>> = {
  SCHOLARSHIP: 'becas',
  OPEN_CALL: 'convocatorias',
};

/** Las becas son de diplomados; las convocatorias, ofertas de tipo convocatoria. */
const OFFER_TYPE_BY_KIND = { SCHOLARSHIP: 'DIPLOMA', OPEN_CALL: 'OPEN_CALL' } as const;

type Flag = 'true';

/**
 * Bandeja de postulaciones (HU-31): pestañas Becas / Convocatorias, filtros,
 * búsqueda y exportación a CSV. Requiere `applications.read`; nunca muestra
 * borradores.
 */
@Component({
  selector: 'adm-applications-page',
  imports: [
    RouterLink,
    Button,
    FilterBar,
    FilterSelect,
    SearchField,
    ListStates,
    Pagination,
    PageHeader,
    Person,
  ],
  templateUrl: './applications-page.html',
  styleUrl: './applications-page.scss',
})
export default class ApplicationsPage {
  private readonly api = inject(AdminApplicationsApi);
  private readonly errors = inject(ErrorPresenter);
  private readonly access = inject(AdminAccess);

  /** `?tipo=becas|convocatorias`. */
  readonly tipo = input<string>();
  protected readonly kind = computed<ApplicationKind>(() =>
    this.tipo() === KIND_PARAMS.OPEN_CALL ? 'OPEN_CALL' : 'SCHOLARSHIP',
  );
  protected readonly kinds = (['SCHOLARSHIP', 'OPEN_CALL'] as const).map((kind) => ({
    kind,
    label: APPLICATION_KIND_LABELS[kind],
    param: KIND_PARAMS[kind],
  }));

  protected readonly canEvaluate = computed(() =>
    this.access.permissions().has('applications.evaluate'),
  );

  protected readonly statusLabels = APPLICATION_STATUS_LABELS;
  protected readonly statusTones = APPLICATION_STATUS_TONES;
  protected readonly levelLabels = SCHOLARSHIP_LEVEL_LABELS;
  protected readonly recommendationLabels = RECOMMENDATION_LABELS;
  protected readonly formatDate = formatOfferDate;
  protected readonly formatDateTime = formatDateTime;

  // --- Filtros (la oferta y el nivel dependen de la pestaña) ---
  protected readonly offerId = linkedSignal<ApplicationKind, string>({
    source: this.kind,
    computation: () => '',
  });
  protected readonly level = linkedSignal<ApplicationKind, ScholarshipLevel | ''>({
    source: this.kind,
    computation: () => '',
  });
  protected readonly status = signal<SubmittedApplicationStatus | ''>('');
  protected readonly countryCode = signal('');
  protected readonly interview = signal<Flag | ''>('');
  protected readonly withoutMine = signal<Flag | ''>('');
  protected readonly sort = signal<ApplicationSort>('SUBMITTED_ASC');

  private readonly countries = toSignal(
    inject(CatalogsApi)
      .countries()
      .pipe(
        map((r) => r.data),
        catchError(() => of([])),
      ),
    { initialValue: [] },
  );
  private readonly countryNames = computed(
    () => new Map(this.countries().map((c) => [c.code, c.name])),
  );

  /** Ofertas de la pestaña (solo si puede verlas: `offers.read`). */
  private readonly offers = offerOptions(() => OFFER_TYPE_BY_KIND[this.kind()]);

  protected readonly options = computed(() => ({
    offers: this.offers(),
    status: optionsFrom(SUBMITTED_APPLICATION_STATUS_VALUES, APPLICATION_STATUS_LABELS),
    level: optionsFrom(SCHOLARSHIP_LEVEL_VALUES, SCHOLARSHIP_LEVEL_LABELS),
    countries: this.countries().map((c) => ({ value: c.code, label: c.name })),
    interview: [{ value: 'true', label: 'Requiere entrevista' }] as FilterOption<Flag>[],
    mine: [{ value: 'true', label: 'Sin mi evaluación' }] as FilterOption<Flag>[],
    sort: [
      { value: 'SUBMITTED_ASC', label: 'Más antiguas primero' },
      { value: 'SUBMITTED_DESC', label: 'Más recientes primero' },
      { value: 'DUE_ASC', label: 'Plazo más próximo' },
    ] as FilterOption<ApplicationSort>[],
  }));

  private readonly filters = computed<ScreenFilters>(() => ({
    kind: this.kind(),
    offerId: this.offerId(),
    status: this.status(),
    level: this.kind() === 'SCHOLARSHIP' ? this.level() : '',
    countryCode: this.countryCode(),
    requiresInterview: this.interview(),
    withoutMyEvaluation: this.withoutMine(),
    sort: this.sort(),
  }));

  protected readonly list = listController({
    fetch: (query) => this.api.list(toApiQuery(query)),
    filters: this.filters,
    notFilters: ['kind', 'sort'],
  });
  protected readonly exporting = signal(false);

  protected countryName(code: string): string {
    return this.countryNames().get(code) ?? code;
  }

  protected clearFilters(): void {
    this.list.clearSearch();
    this.offerId.set('');
    this.level.set('');
    this.status.set('');
    this.countryCode.set('');
    this.interview.set('');
    this.withoutMine.set('');
  }

  /** "Aguas Libres → Ríos Vivos 60%" (solicitado → asignado). */
  protected levelText(item: AdminApplicationListItemDto): string | null {
    const requested = item.requestedLevel ? this.levelLabels[item.requestedLevel] : null;
    if (!item.assignedLevel) return requested;
    const assigned = `${this.levelLabels[item.assignedLevel]}${
      item.assignedPercent !== null ? ` ${item.assignedPercent}%` : ''
    }`;
    return requested && item.assignedLevel !== item.requestedLevel
      ? `${requested} → ${assigned}`
      : assigned;
  }

  /** Descarga el CSV con los filtros actuales (máx. 5000 filas). */
  protected async exportCsv(): Promise<void> {
    this.exporting.set(true);
    try {
      const query = toApiQuery({ ...this.filters(), q: this.list.search() });
      const file = await firstValueFrom(this.api.export(query));
      saveFile(file.blob, file.fileName);
    } catch (error) {
      void this.errors.present(error, { title: 'No se pudo exportar' });
    } finally {
      this.exporting.set(false);
    }
  }
}

/** Filtros tal como están en la pantalla (`''` = sin filtrar). */
interface ScreenFilters {
  readonly kind: ApplicationKind;
  readonly offerId: string;
  readonly status: SubmittedApplicationStatus | '';
  readonly level: ScholarshipLevel | '';
  readonly countryCode: string;
  readonly requiresInterview: Flag | '';
  readonly withoutMyEvaluation: Flag | '';
  readonly sort: ApplicationSort;
}

/** Filtros de la pantalla → query de la API (un estado; banderas como booleano). */
function toApiQuery(
  query: Partial<ScreenFilters> & { q?: string; page?: number; pageSize?: number },
): AdminApplicationsQuery {
  return {
    kind: query.kind,
    offerId: query.offerId || undefined,
    status: query.status ? [query.status] : undefined,
    level: query.level || undefined,
    countryCode: query.countryCode || undefined,
    requiresInterview: query.requiresInterview ? true : undefined,
    withoutMyEvaluation: query.withoutMyEvaluation ? true : undefined,
    sort: query.sort,
    q: query.q || undefined,
    page: query.page,
    pageSize: query.pageSize,
  };
}
