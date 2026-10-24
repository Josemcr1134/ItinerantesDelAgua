import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import { cachedRequest, minutes } from '../cache/cache-options';
import { publicRequest } from '../http-context';
import { ApiBody, ApiResponse } from '../operations.generated';

/** Tipos de beca vigentes (público). Cada oferta usa los suyos en `scholarshipDetails`. */
@Injectable({ providedIn: 'root' })
export class ScholarshipTypesApi {
  private readonly api = inject(ApiClient);

  /** Solo los activos, ordenados; la API los cachea 5 minutos. */
  list() {
    return this.api.get<ApiResponse<'ScholarshipTypes_list'>>('/api/v1/scholarship-types', {
      context: cachedRequest({ ttl: minutes(5) }, publicRequest()),
    });
  }
}

/**
 * Catálogo de tipos de beca del panel: nombre, rango de %, entrevista, cupo y
 * uso. Ver: `offers.read`; crear, editar y borrar: `scholarship_types.write`.
 */
@Injectable({ providedIn: 'root' })
export class AdminScholarshipTypesApi {
  private readonly api = inject(ApiClient);

  private path(id: string): string {
    return `/api/v1/admin/scholarship-types/${encodeURIComponent(id)}`;
  }

  /** Todos, incluidos los inactivos, con su uso y cupo. */
  list() {
    return this.api.get<ApiResponse<'AdminScholarshipTypes_list'>>(
      '/api/v1/admin/scholarship-types',
    );
  }

  /** `key` MAYÚSCULAS_CON_GUION_BAJO, única e inmutable. */
  create(body: ApiBody<'AdminScholarshipTypes_create'>) {
    return this.api.post<ApiResponse<'AdminScholarshipTypes_create'>>(
      '/api/v1/admin/scholarship-types',
      body,
    );
  }

  /** Todo menos `key`; lo ya asignado en postulaciones no cambia. */
  update(id: string, body: ApiBody<'AdminScholarshipTypes_update'>) {
    return this.api.patch<ApiResponse<'AdminScholarshipTypes_update'>>(this.path(id), body);
  }

  /** Solo sin uso (ofertas, postulaciones ni evaluaciones); si no, desactivarlo. */
  remove(id: string) {
    return this.api.delete<ApiResponse<'AdminScholarshipTypes_remove'>>(this.path(id));
  }
}
