import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  linkedSignal,
  viewChild,
} from '@angular/core';
import { rxResource, takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ApiQuery,
  ApiResponse,
  OFFER_TOPIC_VALUES,
  OfferSummaryDto,
  OfferTopic,
  OffersApi,
} from 'data-access';
import { debounceTime, distinctUntilChanged, skip } from 'rxjs';
import { Button, Pagination } from 'ui-kit';
import {
  CATALOG_CONTENT,
  CATALOG_MODALITIES,
  CATALOG_STATUSES,
  CATALOG_TYPES,
} from '../../content/catalog.content';
import { CLOSING_CTA_CONTENT } from '../../content/closing-cta.content';
import { ClosingCta } from '../../sections/closing-cta/closing-cta';
import { browserTimezone } from './catalog-format';
import { OfferCard } from './offer-card/offer-card';

/** Dos filas de cuatro en escritorio. */
const PAGE_SIZE = 8;
/** La API busca desde 3 caracteres. */
const MIN_SEARCH = 3;

type OffersPage = ApiResponse<'Offers_list'>;

/**
 * Catálogo de oferta formativa (HU-15, Figma "Oferta formativa"): filtros por
 * tipo, modalidad, estado, beca y búsqueda (en la URL, para compartir o
 * llegar filtrado desde "Itinerantes del Agua" con `?topic=`), tarjetas en
 * rejilla con paginación numerada (`?pagina=`) y, al cierre, la sección de
 * contacto de la home.
 */
@Component({
  selector: 'pub-catalog-page',
  imports: [RouterLink, Button, Pagination, OfferCard, ClosingCta],
  templateUrl: './catalog-page.html',
  styleUrls: ['./catalog-page.scss', './catalog-filters.scss'],
})
export default class CatalogPage {
  private readonly offers = inject(OffersApi);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** `?tipo=diplomados|cursos|talleres|eventos|convocatorias`. */
  readonly tipo = input<string>();
  /** `?modalidad=en-linea|presencial`. */
  readonly modalidad = input<string>();
  /** `?estado=` (ver CATALOG_STATUSES); por defecto, abiertas y próximas. */
  readonly estado = input<string>();
  /** `?beca=1`: solo con beca disponible. */
  readonly beca = input<string>();
  /** `?q=`: nombre de la oferta o docente. */
  readonly q = input<string>();
  /** `?topic=` (HU-34): temática pública, desde "Itinerantes del Agua". */
  readonly topic = input<string>();
  /** `?pagina=` (desde 1). */
  readonly pagina = input<string>();

  protected readonly c = CATALOG_CONTENT;
  protected readonly types = CATALOG_TYPES;
  protected readonly modalities = CATALOG_MODALITIES;
  protected readonly statuses = CATALOG_STATUSES;
  protected readonly closingCta = CLOSING_CTA_CONTENT;
  protected readonly timezone = browserTimezone();

  protected readonly type = computed(() => this.types.find((t) => t.slug === this.tipo()) ?? null);
  protected readonly modality = computed(
    () => this.modalities.find((m) => m.slug === this.modalidad()) ?? null,
  );
  protected readonly status = computed(
    () => this.statuses.find((s) => s.slug === this.estado()) ?? this.statuses[0],
  );
  protected readonly withScholarship = computed(() => this.beca() === '1');
  private readonly topicValue = computed(() => {
    const value = this.topic() as OfferTopic | undefined;
    return value && OFFER_TOPIC_VALUES.includes(value) ? value : null;
  });
  private readonly searchValue = computed(() => {
    const text = (this.q() ?? '').trim();
    return text.length >= MIN_SEARCH ? text : null;
  });

  /** Lo que se escribe en "Buscar" (se aplica a la URL tras una pausa). */
  protected readonly searchText = linkedSignal(() => this.q() ?? '');
  protected readonly searchTooShort = computed(() => {
    const length = this.searchText().trim().length;
    return length > 0 && length < MIN_SEARCH;
  });

  private readonly filters = computed<ApiQuery<'Offers_list'>>(() => ({
    ...(this.type() ? { type: [this.type()!.type] } : {}),
    ...(this.modality() ? { modality: this.modality()!.modality } : {}),
    status: this.status().statuses,
    ...(this.withScholarship() ? { scholarship: true } : {}),
    ...(this.topicValue() ? { topic: this.topicValue()! } : {}),
    ...(this.searchValue() ? { q: this.searchValue()! } : {}),
    tz: this.timezone,
  }));
  protected readonly hasFilters = computed(
    () =>
      !!this.type() ||
      !!this.modality() ||
      this.status() !== this.statuses[0] ||
      this.withScholarship() ||
      !!this.topicValue() ||
      !!this.searchValue(),
  );

  protected readonly page = computed(() => Math.max(1, Math.floor(Number(this.pagina())) || 1));
  protected readonly list = rxResource({
    params: () => ({ ...this.filters(), page: this.page(), pageSize: PAGE_SIZE }),
    stream: ({ params }) => this.offers.list(params),
  });
  private readonly response = computed(() =>
    this.list.hasValue() ? this.list.value() : undefined,
  );
  /** Ofertas de la página (mientras llega otra, se quedan las anteriores). */
  protected readonly items = linkedSignal<OffersPage | undefined, readonly OfferSummaryDto[]>({
    source: this.response,
    computation: (response, previous) => response?.data ?? previous?.value ?? [],
  });
  protected readonly meta = linkedSignal<OffersPage | undefined, OffersPage['meta'] | null>({
    source: this.response,
    computation: (response, previous) => response?.meta ?? previous?.value ?? null,
  });
  protected readonly loading = computed(() => this.list.isLoading());
  protected readonly failed = computed(() => !!this.list.error());
  private readonly results = viewChild.required<ElementRef<HTMLElement>>('results');

  constructor() {
    // TODO(contenido): confirmar la descripción para buscadores.
    inject(Meta).updateTag({ name: 'description', content: this.c.subtitle });

    // La búsqueda se aplica a la URL tras una pausa (y desde 3 letras).
    toObservable(this.searchText)
      .pipe(skip(1), debounceTime(350), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((text) => {
        const value = text.trim();
        if (value.length && value.length < MIN_SEARCH) return;
        this.setParam('q', value || null);
      });
  }

  /** Cambia un filtro (y vuelve a la primera página). */
  protected setParam(name: string, value: string | null): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [name]: value || null, pagina: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  /** Otra página: queda en el historial ("Atrás" vuelve) y sube al inicio de la lista. */
  protected goToPage(page: number): void {
    void this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: { pagina: page > 1 ? page : null },
        queryParamsHandling: 'merge',
      })
      .then(() => {
        const reduceMotion =
          typeof matchMedia !== 'function' ||
          matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.results().nativeElement.scrollIntoView?.({
          behavior: reduceMotion ? 'auto' : 'smooth',
          block: 'start',
        });
      });
  }

  protected clearFilters(): void {
    this.searchText.set('');
    void this.router.navigate([], { relativeTo: this.route, replaceUrl: true });
  }

  protected retry(): void {
    this.list.reload();
  }
}
