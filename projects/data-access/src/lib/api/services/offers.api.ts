import { inject, Injectable } from '@angular/core';
import { ApiClient, PageQuery, Paginated } from '../api-client';
import { OfferDetailDto, OfferSummaryDto, TopicAvailabilityListDto } from '../models.generated';

export type OfferType = OfferSummaryDto['type'];
export type OfferModality = OfferSummaryDto['modality'];
export type OfferAvailability = OfferSummaryDto['availability'];
export type OfferTopic = NonNullable<OfferSummaryDto['publicTopic']>;

export interface OffersQuery extends PageQuery {
  readonly type?: readonly OfferType[];
  readonly modality?: OfferModality;
  readonly status?: readonly OfferAvailability[];
  readonly scholarship?: boolean;
  readonly topic?: OfferTopic;
  readonly q?: string;
  /** Zona IANA para presentar horarios. */
  readonly tz?: string;
}

/** Oferta formativa. */
@Injectable({ providedIn: 'root' })
export class OffersApi {
  private readonly api = inject(ApiClient);

  list(query: OffersQuery = {}) {
    return this.api.get<Paginated<OfferSummaryDto>>('/api/v1/offers', { query: { ...query } });
  }

  /** Disponibilidad por temática (página Itinerantes del Agua). */
  availability(topics?: readonly OfferTopic[]) {
    return this.api.get<TopicAvailabilityListDto>('/api/v1/offers/availability', {
      query: { topics },
    });
  }

  bySlug(slug: string, tz?: string) {
    return this.api.get<OfferDetailDto>(`/api/v1/offers/${encodeURIComponent(slug)}`, {
      query: { tz },
    });
  }
}
