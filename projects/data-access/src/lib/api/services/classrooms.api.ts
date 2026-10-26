import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { ApiClient } from '../api-client';
import { Uuid } from '../models.generated';
import { ApiBody, ApiQuery, ApiResponse } from '../operations.generated';
import { uploadToSignedUrl } from './admin-offers.api';

/** Aula de una formación. */
@Injectable({ providedIn: 'root' })
export class ClassroomsApi {
  private readonly api = inject(ApiClient);
  private readonly http = inject(HttpClient);

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

  /** Proyecto final en 3 pasos: URL firmada, PUT a storage y confirmación (reemplaza la anterior). */
  uploadFinalProject(
    offerId: Uuid,
    file: File,
  ): Observable<ApiResponse<'Classroom_confirmFinalProject'>> {
    const target$ = this.finalProjectUploadUrl(offerId, {
      fileName: file.name,
      contentType: file.type as ApiBody<'Classroom_finalProjectUploadUrl'>['contentType'],
      sizeBytes: file.size,
    });
    return uploadToSignedUrl(this.http, target$, file).pipe(
      switchMap((key) => this.confirmFinalProject(offerId, { key, fileName: file.name })),
    );
  }

  /** Proyecto final: descargar mi entrega. */
  finalProjectDownload(offerId: Uuid) {
    return this.api.get<ApiResponse<'Classroom_finalProjectDownload'>>(
      `${this.path(offerId)}/final-project/download`,
    );
  }
}
