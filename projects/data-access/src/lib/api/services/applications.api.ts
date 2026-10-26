import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { ApiClient, commaList } from '../api-client';
import { Uuid } from '../models.generated';
import { ApiBody, ApiQuery, ApiResponse } from '../operations.generated';
import { uploadToSignedUrl } from './admin-offers.api';

/**
 * Postulaciones del participante (HU-19 a HU-21): becas (`kind=SCHOLARSHIP`)
 * y convocatorias (`kind=OPEN_CALL`). Borrador → evidencias → envío.
 */
@Injectable({ providedIn: 'root' })
export class ApplicationsApi {
  private readonly api = inject(ApiClient);
  private readonly http = inject(HttpClient);
  private readonly base = '/api/v1/me/applications';

  private path(id: Uuid): string {
    return `${this.base}/${encodeURIComponent(id)}`;
  }

  /** "Becas disponibles" o "Convocatorias abiertas". */
  opportunities(query: ApiQuery<'Applications_opportunities'>) {
    return this.api.get<ApiResponse<'Applications_opportunities'>>(`${this.base}/opportunities`, {
      query: { ...query },
    });
  }

  /** Mis postulaciones (estados separados por coma). */
  list(query: ApiQuery<'Applications_list'> = {}) {
    return this.api.get<ApiResponse<'Applications_list'>>(this.base, {
      query: { ...query, status: commaList(query.status) },
    });
  }

  /** Crea el borrador (una postulación por cohorte). */
  create(body: ApiBody<'Applications_create'>) {
    return this.api.post<ApiResponse<'Applications_create'>>(this.base, body);
  }

  get(id: Uuid) {
    return this.api.get<ApiResponse<'Applications_get'>>(this.path(id));
  }

  /** Guarda el borrador (solo los campos enviados; `null` borra). */
  update(id: Uuid, body: ApiBody<'Applications_update'>) {
    return this.api.patch<ApiResponse<'Applications_update'>>(this.path(id), body);
  }

  /** Descarta el borrador. */
  remove(id: Uuid) {
    return this.api.delete<void>(this.path(id));
  }

  submit(id: Uuid) {
    return this.api.post<ApiResponse<'Applications_submit'>>(`${this.path(id)}/submit`);
  }

  /** Confirma la participación (aprobada sin costo). */
  confirm(id: Uuid) {
    return this.api.post<ApiResponse<'Applications_confirm'>>(`${this.path(id)}/confirm`);
  }

  /** Evidencia en 3 pasos: URL firmada, PUT a storage y confirmación. */
  uploadDocument(id: Uuid, file: File): Observable<ApiResponse<'Applications_confirmDocument'>> {
    const target$ = this.api.post<ApiResponse<'Applications_uploadUrl'>>(
      `${this.path(id)}/documents/upload-url`,
      {
        fileName: file.name,
        contentType: file.type as ApiBody<'Applications_uploadUrl'>['contentType'],
        sizeBytes: file.size,
      },
    );
    return uploadToSignedUrl(this.http, target$, file).pipe(
      switchMap((key) =>
        this.api.post<ApiResponse<'Applications_confirmDocument'>>(`${this.path(id)}/documents`, {
          key,
          fileName: file.name,
        }),
      ),
    );
  }

  deleteDocument(id: Uuid, documentId: Uuid) {
    return this.api.delete<void>(`${this.path(id)}/documents/${encodeURIComponent(documentId)}`);
  }

  /** URL temporal para ver un archivo propio. */
  downloadDocument(id: Uuid, documentId: Uuid) {
    return this.api.get<ApiResponse<'Applications_download'>>(
      `${this.path(id)}/documents/${encodeURIComponent(documentId)}/download`,
    );
  }
}
