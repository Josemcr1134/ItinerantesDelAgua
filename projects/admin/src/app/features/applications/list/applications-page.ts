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
  SUBMITTED_APPLICATION_STATUS_VALUES,
  SubmittedApplicationStatus,
} from 'data-access';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { Button, Pagination } from 'ui-kit';
import { AdminAccess } from '../../../core/access/admin-access';
import { saveFile } from '../../../core/download';
import { ErrorPresenter } from '../../../core/error-presenter';
import { FilterBar } from '../../../shared/filters/filter-bar';
import { FilterOption, FilterSelect, optionsFrom } from '../../../shared/filters/filter-select';
import { offerOptions } from '../../../shared/filters/offer-options';
import { SearchField } from '../../../shared/filters/search-field';
import { listController } from '../../../shared/list/list-controller';
import { ListStates } from '../../../shared/list/list-states';
import { PageHeader } from '../../../shared/page-header/page-header';
import { Person } from '../../../shared/person/person';
import { scholarshipTypeOptions } from '../../scholarship-types/scholarship-type-labels';
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

/**
 * "Aprobadas": los estados que ocupan cupo de beca (pendiente de pago, de
 * confirmación e inscrita). En la URL, `?estado=aprobadas`.
 */
const APPROVED = 'APPROVED';
const APPROVED_STATUSES: readonly SubmittedApplicationStatus[] = [
  'APPROVED_PENDING_PAYMENT',
  'APPROVED_PENDING_CONFIRMATION',
  'ENROLLED',
];
type StatusFilter = SubmittedApplicationStatus | typeof APPROVED;

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
  /** `?beca=<id>`: tipo de beca solicitado (desde «Becas»). */
  readonly beca = input<string>();
  /** `?estado=aprobadas` o un estado de la API. */
  readonly estado = input<string>();
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
  protected readonly recommendationLabels = RECOMMENDATION_LABELS;
  protected readonly formatDate = formatOfferDate;
  protected readonly formatDateTime = formatDateTime;

  // --- Filtros (la oferta y el nivel dependen de la pestaña) ---
  protected readonly offerId = linkedSignal<ApplicationKind, string>({
    source: this.kind,
    computation: () => '',
  });
  protected readonly scholarshipTypeId = linkedSignal({
    source: () => ({ kind: this.kind(), beca: this.beca() }),
    computation: ({ beca }) => beca ?? '',
  });
  protected readonly status = linkedSignal<string | undefined, StatusFilter | ''>({
    source: this.estado,
    computation: (estado) =>
      estado === 'aprobadas'
        ? APPROVED
        : (SUBMITTED_APPLICATION_STATUS_VALUES as readonly string[]).includes(estado ?? '')
          ? (estado as SubmittedApplicationStatus)
          : '',
  });
  /** Filtrar por beca aprobada usa la solicitada: la asignada puede ser otra. */
  protected readonly approvedByScholarship = computed(
    () => this.status() === APPROVED && !!this.scholarshipTypeId(),
  );
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

  /** Tipos de beca del catálogo, para filtrar. */
  private readonly scholarshipTypes = scholarshipTypeOptions();

  protected readonly options = computed(() => ({
    offers: this.offers(),
    status: [
      { value: APPROVED, label: 'Aprobadas (todas)' },
      ...optionsFrom(SUBMITTED_APPLICATION_STATUS_VALUES, APPLICATION_STATUS_LABELS),
    ] as FilterOption<StatusFilter>[],
    scholarshipTypes: this.scholarshipTypes(),
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
    scholarshipTypeId: this.kind() === 'SCHOLARSHIP' ? this.scholarshipTypeId() : '',
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
    this.scholarshipTypeId.set('');
    this.status.set('');
    this.countryCode.set('');
    this.interview.set('');
    this.withoutMine.set('');
  }

  /** "Aguas Libres → Ríos Vivos 60%" (tipo de beca solicitado → asignado). */
  protected scholarshipText(item: AdminApplicationListItemDto): string | null {
    const requested = item.requestedScholarshipType?.name ?? null;
    const assigned = item.assignedScholarshipType;
    if (!assigned) return requested;
    const assignedText = `${assigned.name}${
      item.assignedPercent !== null ? ` ${item.assignedPercent}%` : ''
    }`;
    return requested && item.assignedScholarshipTypeId !== item.requestedScholarshipTypeId
      ? `${requested} → ${assignedText}`
      : assignedText;
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
  readonly status: StatusFilter | '';
  readonly scholarshipTypeId: string;
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
    status:
      query.status === APPROVED
        ? [...APPROVED_STATUSES]
        : query.status
          ? [query.status]
          : undefined,
    scholarshipTypeId: query.scholarshipTypeId || undefined,
    countryCode: query.countryCode || undefined,
    requiresInterview: query.requiresInterview ? true : undefined,
    withoutMyEvaluation: query.withoutMyEvaluation ? true : undefined,
    sort: query.sort,
    q: query.q || undefined,
    page: query.page,
    pageSize: query.pageSize,
  };
}
