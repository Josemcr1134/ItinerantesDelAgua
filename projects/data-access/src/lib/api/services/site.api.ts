import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import { cachedRequest, hours } from '../cache/cache-options';
import { publicRequest, silentRequest } from '../http-context';
import { ApiResponse } from '../operations.generated';

/** Contenido público de la landing. */
@Injectable({ providedIn: 'root' })
export class SiteApi {
  private readonly api = inject(ApiClient);

  /**
   * Cifras de impacto visibles, ordenadas. Cambian pocas veces (las edita el
   * equipo): se cachean 1 h y después se renuevan en segundo plano.
   */
  metrics() {
    return this.api.get<ApiResponse<'SiteMetrics_list'>>('/api/v1/site/metrics', {
      context: cachedRequest({ ttl: hours(1) }, silentRequest(publicRequest())),
    });
  }
}
