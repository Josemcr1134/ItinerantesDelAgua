import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { OfferDetailDto, OffersApi, toApiError } from 'data-access';
import { Button } from 'ui-kit';
import { CATALOG_CONFIG } from '../catalog-config';
import { CATALOG_TYPES, OFFER_CARD_CONTENT } from '../catalog-content';
import { browserTimezone } from '../catalog-format';
import { OFFER_DETAIL_CONTENT } from '../offer-detail-content';
import { OfferCarousel } from './offer-carousel/offer-carousel';
import { OfferSummary } from './offer-summary/offer-summary';

/** Semblanzas más largas se recortan con [Ver más]. */
const BIO_PREVIEW = 120;

/**
 * Ficha de una oferta (HU-16, Figma): carrusel, nombre y etiquetas, qué
 * aprenderás, temario, requisitos o elegibilidad, docentes y, a la derecha,
 * el resumen con costo, beca y las acciones. La usan la landing y el Portal
 * (con la sesión, la API calcula las acciones de esa persona).
 */
@Component({
  selector: 'cat-offer-detail',
  imports: [RouterLink, Button, OfferCarousel, OfferSummary],
  templateUrl: './offer-detail.html',
  styleUrls: ['./offer-detail.scss', './offer-detail-sections.scss'],
})
export class OfferDetail {
  private readonly offers = inject(OffersApi);

  readonly slug = input.required<string>();
  /** "← Volver" y la ruta encima del contenido (el Portal las pone en su encabezado). */
  readonly showCrumbs = input(true);
  /** La oferta llegó (para el título de la página). */
  readonly loaded = output<OfferDetailDto>();

  protected readonly t = OFFER_DETAIL_CONTENT;
  protected readonly cardText = OFFER_CARD_CONTENT;
  protected readonly catalogPath = inject(CATALOG_CONFIG).catalogPath;
  protected readonly timezone = browserTimezone();

  protected readonly offer = rxResource({
    params: () => this.slug(),
    stream: ({ params }) => this.offers.bySlug(params, { tz: this.timezone }),
  });
  protected readonly current = computed(() =>
    this.offer.hasValue() ? this.offer.value() : undefined,
  );
  protected readonly error = computed(() => {
    const error = this.offer.error();
    if (!error) return null;
    const apiError = toApiError(error);
    return apiError.statusCode === 404 ? this.t.notFound : this.t.error;
  });
  protected readonly notFound = computed(() => this.error() === this.t.notFound);

  /** Tipo en plural para la ruta ("Diplomados") y su filtro del catálogo. */
  protected readonly typeCrumb = computed(() => {
    const type = this.current()?.type;
    return CATALOG_TYPES.find((t) => t.type === type) ?? null;
  });

  protected readonly images = computed(() => {
    const o = this.current();
    if (!o) return [];
    if (o.carouselImageUrls.length) return o.carouselImageUrls;
    return [o.coverImageUrl ?? this.cardText.fallbackImages[o.type]];
  });

  protected readonly modality = computed(() => {
    const o = this.current();
    if (!o) return '';
    const base = this.t.modality[o.modality];
    return o.modality === 'IN_PERSON' && o.venue?.city ? `${base} · ${o.venue.city}` : base;
  });

  /** "9 módulos · 60 h + proyecto final · aprox. 3 meses". */
  protected readonly syllabusMeta = computed(() => {
    const o = this.current();
    if (!o) return '';
    const s = this.t.syllabus;
    const parts: string[] = [];
    if (o.modules.length) parts.push(s.modules(o.modules.length));
    if (o.totalHours) {
      parts.push(
        `${s.hours(o.totalHours)}${o.dates.finalProjectDueAt ? ` ${s.finalProject}` : ''}`,
      );
    }
    if (o.dates.startsAt && o.dates.endsAt) {
      const days =
        (new Date(o.dates.endsAt).getTime() - new Date(o.dates.startsAt).getTime()) / 86_400_000;
      if (days >= 45) parts.push(s.months(Math.round(days / 30)));
      else if (days >= 7) parts.push(s.weeks(Math.round(days / 7)));
    }
    return parts.join(' · ');
  });

  protected readonly countries = computed(() =>
    (this.current()?.eligibility?.countries ?? []).map((c) => c.name).join(', '),
  );

  /** Docentes con la semblanza desplegada. */
  protected readonly expanded = signal<ReadonlySet<string>>(new Set());
  protected readonly bioPreview = BIO_PREVIEW;

  constructor() {
    effect(() => {
      const o = this.current();
      if (o) this.loaded.emit(o);
    });
  }

  protected initials(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? '')
      .join('');
  }

  protected bio(id: string, text: string | null): string {
    if (!text) return this.t.teacher.bioFallback;
    return this.expanded().has(id) || text.length <= BIO_PREVIEW
      ? text
      : `${text.slice(0, BIO_PREVIEW).trimEnd()}…`;
  }

  protected toggleBio(id: string): void {
    this.expanded.update((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
}
