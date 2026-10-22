import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import { cachedRequest, minutes } from '../cache/cache-options';
import { ApiQuery, ApiResponse } from '../operations.generated';

/** Oferta formativa. */
@Injectable({ providedIn: 'root' })
export class OffersApi {
  private readonly api = inject(ApiClient);

  list(query: ApiQuery<'Offers_list'> = {}) {
    return this.api.get<ApiResponse<'Offers_list'>>('/api/v1/offers', { query: { ...query } });
  }

  /** Disponibilidad por temática (página Itinerantes del Agua). Caché de 15 min. */
  availability(query: ApiQuery<'Offers_availability'> = {}) {
    return this.api.get<ApiResponse<'Offers_availability'>>('/api/v1/offers/availability', {
      query: { ...query },
      context: cachedRequest({ ttl: minutes(15) }),
    });
  }

  bySlug(slug: string, query: ApiQuery<'Offers_detail'> = {}) {
    return this.api.get<ApiResponse<'Offers_detail'>>(
      `/api/v1/offers/${encodeURIComponent(slug)}`,
      { query: { ...query } },
    );
  }
}
