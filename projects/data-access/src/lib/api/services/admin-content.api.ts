import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../api-client';
import { MaterialResourceType, Uuid } from '../models.generated';
import { ApiBody, ApiResponse } from '../operations.generated';
import { uploadToSignedUrl } from './admin-offers.api';

/** Archivos aceptados por sección (HU-28) y tamaño máximo. */
export const RESOURCE_UPLOAD_RULES: {
  readonly maxBytes: number;
  readonly contentTypes: Readonly<Record<MaterialResourceType, readonly string[]>>;
} = (() => {
  const pdf = 'application/pdf';
  const pptx = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
  const docx = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const epub = 'application/epub+zip';
  return {
    maxBytes: 50 * 1024 * 1024,
    contentTypes: {
      PRESENTATION: [pdf, pptx],
      PRE_READING: [pdf, docx, epub],
      ACTIVITY: [pdf, pptx, docx, epub],
    },
  };
})();

/** Contenido del aula de una oferta: módulos y sus recursos (HU-28). */
@Injectable({ providedIn: 'root' })
export class AdminContentApi {
  private readonly api = inject(ApiClient);
  private readonly http = inject(HttpClient);

  private module(id: Uuid): string {
    return `/api/v1/admin/modules/${encodeURIComponent(id)}`;
  }

  private resource(id: Uuid): string {
    return `/api/v1/admin/resources/${encodeURIComponent(id)}`;
  }

  /** Módulos (incluidos los ocultos) con sus cuatro secciones. */
  list(offerId: Uuid) {
    return this.api.get<ApiResponse<'AdminContent_list'>>(
      `/api/v1/admin/offers/${encodeURIComponent(offerId)}/modules`,
    );
  }

  /** Se crea al final, oculto y con las secciones vacías. */
  createModule(offerId: Uuid, body: ApiBody<'AdminContent_createModule'>) {
    return this.api.post<ApiResponse<'AdminContent_createModule'>>(
      `/api/v1/admin/offers/${encodeURIComponent(offerId)}/modules`,
      body,
    );
  }

  /** Todos los módulos en el nuevo orden (la numeración se recalcula). */
  reorderModules(offerId: Uuid, body: ApiBody<'AdminContent_reorderModules'>) {
    return this.api.put<ApiResponse<'AdminContent_reorderModules'>>(
      `/api/v1/admin/offers/${encodeURIComponent(offerId)}/modules/order`,
      body,
    );
  }

  updateModule(moduleId: Uuid, body: ApiBody<'AdminContent_updateModule'>) {
    return this.api.patch<ApiResponse<'AdminContent_updateModule'>>(this.module(moduleId), body);
  }

  /** Borra el módulo y sus recursos (las sesiones quedan sin módulo). */
  deleteModule(moduleId: Uuid) {
    return this.api.delete<ApiResponse<'AdminContent_deleteModule'>>(this.module(moduleId));
  }

  createResource(moduleId: Uuid, body: ApiBody<'AdminContent_createResource'>) {
    return this.api.post<ApiResponse<'AdminContent_createResource'>>(
      `${this.module(moduleId)}/resources`,
      body,
    );
  }

  /** Todos los recursos del módulo en el nuevo orden. */
  reorderResources(moduleId: Uuid, body: ApiBody<'AdminContent_reorderResources'>) {
    return this.api.put<ApiResponse<'AdminContent_reorderResources'>>(
      `${this.module(moduleId)}/resources/order`,
      body,
    );
  }

  updateResource(resourceId: Uuid, body: ApiBody<'AdminContent_updateResource'>) {
    return this.api.patch<ApiResponse<'AdminContent_updateResource'>>(
      this.resource(resourceId),
      body,
    );
  }

  deleteResource(resourceId: Uuid) {
    return this.api.delete<ApiResponse<'AdminContent_deleteResource'>>(this.resource(resourceId));
  }

  /** Sube el archivo de un recurso y devuelve su `key`. */
  uploadResourceFile(moduleId: Uuid, type: MaterialResourceType, file: File): Observable<string> {
    return uploadToSignedUrl(
      this.http,
      this.api.post<ApiResponse<'AdminContent_uploadUrl'>>(
        `${this.module(moduleId)}/resources/upload-url`,
        { type, fileName: file.name, contentType: file.type, sizeBytes: file.size },
      ),
      file,
    );
  }
}
