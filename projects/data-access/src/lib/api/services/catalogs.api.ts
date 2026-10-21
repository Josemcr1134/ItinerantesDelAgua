import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import { publicRequest } from '../http-context';
import { Uuid } from '../models.generated';
import { ApiQuery, ApiResponse } from '../operations.generated';

/** Catálogos públicos: ubicaciones y zonas horarias. */
@Injectable({ providedIn: 'root' })
export class CatalogsApi {
  private readonly api = inject(ApiClient);
  private readonly options = { context: publicRequest() };

  countries() {
    return this.api.get<ApiResponse<'Locations_countries'>>(
      '/api/v1/locations/countries',
      this.options,
    );
  }

  /** Estados / departamentos de un país (código ISO-3166 alpha-2). */
  divisions(countryCode: string) {
    return this.api.get<ApiResponse<'Locations_divisions'>>(
      `/api/v1/locations/countries/${encodeURIComponent(countryCode)}/divisions`,
      this.options,
    );
  }

  municipalities(divisionId: Uuid) {
    return this.api.get<ApiResponse<'Locations_municipalities'>>(
      `/api/v1/locations/divisions/${encodeURIComponent(divisionId)}/municipalities`,
      this.options,
    );
  }

  /** Zonas horarias; `at` (ISO) calcula los desfases en esa fecha. */
  timezones(query: ApiQuery<'Locations_timezones'> = {}) {
    return this.api.get<ApiResponse<'Locations_timezones'>>('/api/v1/timezones', {
      ...this.options,
      query: { ...query },
    });
  }
}
