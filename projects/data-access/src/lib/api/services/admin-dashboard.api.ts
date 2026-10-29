import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import { ApiQuery, ApiResponse } from '../operations.generated';

export type AdminDashboardQuery = ApiQuery<'AdminDashboard_overview'>;

/**
 * Inicio del panel (Fase 08). Cada bloque llega en `null` si el rol no tiene
 * su permiso (`training`: `offers.read`, `applications`, `payments`,
 * `contact`); `people` lo ve todo el equipo. Los montos van en centavos y por
 * moneda: MXN y USD nunca se suman.
 */
@Injectable({ providedIn: 'root' })
export class AdminDashboardApi {
  private readonly api = inject(ApiClient);
  private readonly base = '/api/v1/admin/dashboard';

  /** Cifras del periodo `from`–`to` (por defecto, los últimos 30 días) y pendientes de hoy. */
  overview(query: AdminDashboardQuery = {}) {
    return this.api.get<ApiResponse<'AdminDashboard_overview'>>(this.base, {
      query: { ...query },
    });
  }

  /** Series por mes (hora de CDMX), del más antiguo al actual; `months` 1–24 (6 por defecto). */
  trends(months?: number) {
    return this.api.get<ApiResponse<'AdminDashboard_trends'>>(`${this.base}/trends`, {
      query: { months },
    });
  }
}
