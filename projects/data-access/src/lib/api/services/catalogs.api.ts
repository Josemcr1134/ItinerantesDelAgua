import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import { publicRequest } from '../http-context';
import {
  CountryListResponseDto,
  DivisionListResponseDto,
  MunicipalityListResponseDto,
  TimezonesResponseDto,
} from '../models.generated';

/** Catálogos públicos: ubicaciones y zonas horarias. */
@Injectable({ providedIn: 'root' })
export class CatalogsApi {
  private readonly api = inject(ApiClient);

  countries() {
    return this.api.get<CountryListResponseDto>('/api/v1/locations/countries', {
      context: publicRequest(),
    });
  }

  /** Estados / departamentos de un país (código ISO). */
  divisions(countryCode: string) {
    return this.api.get<DivisionListResponseDto>(
      `/api/v1/locations/countries/${encodeURIComponent(countryCode)}/divisions`,
      { context: publicRequest() },
    );
  }

  municipalities(divisionId: string) {
    return this.api.get<MunicipalityListResponseDto>(
      `/api/v1/locations/divisions/${encodeURIComponent(divisionId)}/municipalities`,
      { context: publicRequest() },
    );
  }

  /** Zonas horarias; `at` (ISO) calcula los desfases en esa fecha. */
  timezones(at?: string) {
    return this.api.get<TimezonesResponseDto>('/api/v1/timezones', {
      query: { at },
      context: publicRequest(),
    });
  }
}
