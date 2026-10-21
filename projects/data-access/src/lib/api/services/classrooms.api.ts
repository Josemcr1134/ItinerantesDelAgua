import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import { Uuid } from '../models.generated';
import { ApiBody, ApiQuery, ApiResponse } from '../operations.generated';

/** Aula de una formación. */
@Injectable({ providedIn: 'root' })
export class ClassroomsApi {
  private readonly api = inject(ApiClient);

  private path(offerId: Uuid): string {
    return `/api/v1/me/classrooms/${encodeURIComponent(offerId)}`;
  }

  classroom(offerId: Uuid) {
    return this.api.get<ApiResponse<'Classroom_get'>>(this.path(offerId));
  }

  materials(offerId: Uuid) {
    return this.api.get<ApiResponse<'Classroom_materials'>>(`${this.path(offerId)}/materials`);
  }

  /** URL temporal para abrir / descargar un recurso. */
  resourceAccess(offerId: Uuid, resourceId: Uuid) {
    return this.api.get<ApiResponse<'Classroom_resourceAccess'>>(
      `${this.path(offerId)}/resources/${encodeURIComponent(resourceId)}/access`,
    );
  }

  sessions(offerId: Uuid, query: ApiQuery<'Classroom_sessions'> = {}) {
    return this.api.get<ApiResponse<'Classroom_sessions'>>(`${this.path(offerId)}/sessions`, {
      query: { ...query },
    });
  }

  /** Proyecto final: pedir URL de carga. */
  finalProjectUploadUrl(offerId: Uuid, body: ApiBody<'Classroom_finalProjectUploadUrl'>) {
    return this.api.post<ApiResponse<'Classroom_finalProjectUploadUrl'>>(
      `${this.path(offerId)}/final-project/upload-url`,
      body,
    );
  }

  /** Proyecto final: confirmar entrega. */
  confirmFinalProject(offerId: Uuid, body: ApiBody<'Classroom_confirmFinalProject'>) {
    return this.api.put<ApiResponse<'Classroom_confirmFinalProject'>>(
      `${this.path(offerId)}/final-project`,
      body,
    );
  }

  /** Proyecto final: descargar mi entrega. */
  finalProjectDownload(offerId: Uuid) {
    return this.api.get<ApiResponse<'Classroom_finalProjectDownload'>>(
      `${this.path(offerId)}/final-project/download`,
    );
  }
}
