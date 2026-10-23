import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import { ApiBody, ApiQuery, ApiResponse } from '../operations.generated';

/**
 * Acceso de ofertas de origen Moodle (HU-25 / HU-27): lista de correos
 * inscritos y códigos de acceso de un solo uso. Otra oferta → 422
 * `OFFER_NOT_MOODLE`. Ver: `offers.read`; cambiar: `offers.write`.
 */
@Injectable({ providedIn: 'root' })
export class AdminMoodleApi {
  private readonly api = inject(ApiClient);

  private path(offerId: string, rest: string): string {
    return `/api/v1/admin/offers/${encodeURIComponent(offerId)}/moodle${rest}`;
  }

  /** Correos cargados y si ya quedaron vinculados a una cuenta. */
  roster(offerId: string, query: ApiQuery<'AdminMoodle_roster'> = {}) {
    return this.api.get<ApiResponse<'AdminMoodle_roster'>>(this.path(offerId, '/roster'), {
      query: { ...query },
    });
  }

  /**
   * Carga correos (contenido de un CSV en `csv` o un arreglo en `emails`).
   * Sin duplicados; quien ya tiene cuenta queda inscrito "Vía Moodle".
   */
  importRoster(offerId: string, body: ApiBody<'AdminMoodle_importRoster'>) {
    return this.api.post<ApiResponse<'AdminMoodle_importRoster'>>(
      this.path(offerId, '/roster'),
      body,
    );
  }

  /** Solo correos aún no vinculados. */
  removeEntry(offerId: string, entryId: string) {
    return this.api.delete<ApiResponse<'AdminMoodle_removeEntry'>>(
      this.path(offerId, `/roster/${encodeURIComponent(entryId)}`),
    );
  }

  /** Pista (últimos 4), vencimiento y quién lo canjeó. */
  codes(offerId: string, query: ApiQuery<'AdminMoodle_codes'> = {}) {
    return this.api.get<ApiResponse<'AdminMoodle_codes'>>(this.path(offerId, '/codes'), {
      query: { ...query },
    });
  }

  /** 1–200 códigos `XXXX-XXXX`; se devuelven en claro UNA sola vez. */
  generateCodes(offerId: string, body: ApiBody<'AdminMoodle_generate'>) {
    return this.api.post<ApiResponse<'AdminMoodle_generate'>>(this.path(offerId, '/codes'), body);
  }
}
