import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import { ApiQuery, ApiResponse } from '../operations.generated';

export type AdminAuditQuery = ApiQuery<'AdminAudit_list'>;

/**
 * Registro de auditoría del panel: toda acción de escritura con su actor,
 * entidad y el antes/después de lo que cambió. Permiso `audit.read`.
 */
@Injectable({ providedIn: 'root' })
export class AdminAuditApi {
  private readonly api = inject(ApiClient);

  /**
   * Más reciente primero. `action` admite un prefijo (`offer.` = todas las de
   * ofertas); `entityType` + `entityId` dan el historial de una entidad.
   */
  list(query: AdminAuditQuery = {}) {
    return this.api.get<ApiResponse<'AdminAudit_list'>>('/api/v1/admin/audit-logs', {
      query: { ...query },
    });
  }
}
