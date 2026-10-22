import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import { ApiBody, ApiResponse } from '../operations.generated';

/** Contenido de la landing que edita el equipo (permiso `site.write`). */
@Injectable({ providedIn: 'root' })
export class AdminSiteApi {
  private readonly api = inject(ApiClient);

  /** Cifras de impacto, incluidas las ocultas. */
  metrics() {
    return this.api.get<ApiResponse<'AdminSiteMetrics_list'>>('/api/v1/admin/site/metrics');
  }

  /**
   * Cambia número, texto, prefijo/sufijo, orden o visibilidad de una cifra.
   * La landing la muestra cuando vence su caché (unos minutos).
   */
  updateMetric(key: string, body: ApiBody<'AdminSiteMetrics_update'>) {
    return this.api.patch<ApiResponse<'AdminSiteMetrics_update'>>(
      `/api/v1/admin/site/metrics/${encodeURIComponent(key)}`,
      body,
    );
  }
}
