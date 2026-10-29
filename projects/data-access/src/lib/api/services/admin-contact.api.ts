import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import { silentRequest } from '../http-context';
import { Uuid } from '../models.generated';
import { ApiBody, ApiQuery, ApiResponse } from '../operations.generated';

export type AdminContactQuery = ApiQuery<'AdminContact_list'>;

/**
 * Bandeja de Contacto (HU-38 / HU-01): mensajes del formulario de Contacto y
 * de la landing. Consultar: `contact.read`; cambiar el estado o la nota
 * interna: `contact.manage`. Abrir un mensaje no cambia su estado.
 */
@Injectable({ providedIn: 'root' })
export class AdminContactApi {
  private readonly api = inject(ApiClient);
  private readonly base = '/api/v1/admin/contact-messages';

  /** Más recientes primero; `q` busca en nombre, correo, organización y texto. */
  list(query: AdminContactQuery = {}) {
    return this.api.get<ApiResponse<'AdminContact_list'>>(this.base, { query: { ...query } });
  }

  /** Sin leer (`NEW`, contador del menú) y total por estado: sin el loader general. */
  summary() {
    return this.api.get<ApiResponse<'AdminContact_summary'>>(`${this.base}/summary`, {
      context: silentRequest(),
    });
  }

  get(id: Uuid) {
    return this.api.get<ApiResponse<'AdminContact_get'>>(`${this.base}/${encodeURIComponent(id)}`);
  }

  /** Estado y/o nota interna (`internalNote: null` la borra). */
  update(id: Uuid, body: ApiBody<'AdminContact_update'>) {
    return this.api.patch<ApiResponse<'AdminContact_update'>>(
      `${this.base}/${encodeURIComponent(id)}`,
      body,
    );
  }
}
