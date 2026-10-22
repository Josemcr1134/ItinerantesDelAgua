import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { ApiClient } from '../api-client';
import { ImageContentType, ImageUploadPurpose, Uuid } from '../models.generated';
import { ApiBody, ApiQuery, ApiResponse } from '../operations.generated';

/** Cuerpo de cada paso del asistente, por su segmento en la URL. */
export interface OfferStepBodies {
  readonly general: ApiBody<'AdminOffers_general'>;
  readonly content: ApiBody<'AdminOffers_content'>;
  readonly schedule: ApiBody<'AdminOffers_schedule'>;
  readonly 'origin-pricing': ApiBody<'AdminOffers_originPricing'>;
  readonly attendance: ApiBody<'AdminOffers_attendance'>;
  readonly whatsapp: ApiBody<'AdminOffers_whatsapp'>;
}
export type OfferStepSlug = keyof OfferStepBodies;

/** Oferta formativa en el panel: listado, asistente por pasos y publicación. */
@Injectable({ providedIn: 'root' })
export class AdminOffersApi {
  private readonly api = inject(ApiClient);

  private path(id: Uuid): string {
    return `/api/v1/admin/offers/${encodeURIComponent(id)}`;
  }

  list(query: ApiQuery<'AdminOffers_list'> = {}) {
    return this.api.get<ApiResponse<'AdminOffers_list'>>('/api/v1/admin/offers', {
      query: { ...query },
    });
  }

  /** Detalle con todos los pasos y el estado del asistente (`wizard`). */
  detail(id: Uuid) {
    return this.api.get<ApiResponse<'AdminOffers_detail'>>(this.path(id));
  }

  /** "+ Nueva oferta": crea el borrador. */
  create(body: ApiBody<'AdminOffers_create'>) {
    return this.api.post<ApiResponse<'AdminOffers_create'>>('/api/v1/admin/offers', body);
  }

  /**
   * Guarda un paso como borrador (acepta datos incompletos) y devuelve el
   * detalle con el asistente recalculado.
   */
  updateStep<S extends OfferStepSlug>(id: Uuid, step: S, body: OfferStepBodies[S]) {
    return this.api.patch<ApiResponse<'AdminOffers_general'>>(
      `${this.path(id)}/steps/${step}`,
      body,
    );
  }

  publish(id: Uuid) {
    return this.api.post<ApiResponse<'AdminOffers_publish'>>(`${this.path(id)}/publish`);
  }

  /** Publicado o archivado → borrador. */
  unpublish(id: Uuid) {
    return this.api.post<ApiResponse<'AdminOffers_unpublish'>>(`${this.path(id)}/unpublish`);
  }

  archive(id: Uuid) {
    return this.api.post<ApiResponse<'AdminOffers_archive'>>(`${this.path(id)}/archive`);
  }

  /** Nueva cohorte en borrador (copia contenido, precio, horario y docentes). */
  duplicate(id: Uuid, body: ApiBody<'AdminOffers_duplicate'> = {}) {
    return this.api.post<ApiResponse<'AdminOffers_duplicate'>>(`${this.path(id)}/duplicate`, body);
  }

  /** Solo borradores sin inscripciones, postulaciones ni pagos. */
  remove(id: Uuid) {
    return this.api.delete<ApiResponse<'AdminOffers_remove'>>(this.path(id));
  }
}

/** Docentes (selector del paso 1). */
@Injectable({ providedIn: 'root' })
export class AdminTeachersApi {
  private readonly api = inject(ApiClient);

  list(query: ApiQuery<'AdminTeachers_list'> = {}) {
    return this.api.get<ApiResponse<'AdminTeachers_list'>>('/api/v1/admin/teachers', {
      query: { ...query },
    });
  }
}

/** Imágenes permitidas y tamaño máximo (lo valida también la API). */
export const IMAGE_UPLOAD_RULES = {
  contentTypes: ['image/jpeg', 'image/png', 'image/webp'] as readonly ImageContentType[],
  maxBytes: 5 * 1024 * 1024,
} as const;

/** Subida de imágenes de difusión (portada, carrusel, foto de docente). */
@Injectable({ providedIn: 'root' })
export class AdminUploadsApi {
  private readonly api = inject(ApiClient);
  private readonly http = inject(HttpClient);

  /** Pide una URL firmada para subir la imagen. */
  imageUploadUrl(body: ApiBody<'AdminUploads_imageUploadUrl'>) {
    return this.api.post<ApiResponse<'AdminUploads_imageUploadUrl'>>(
      '/api/v1/admin/uploads/images',
      body,
    );
  }

  /**
   * Sube una imagen completa: pide la URL firmada, hace el PUT del archivo y
   * devuelve la `key` para guardarla en la oferta o el docente.
   */
  uploadImage(file: File, purpose: ImageUploadPurpose, offerId?: Uuid): Observable<string> {
    return this.imageUploadUrl({
      purpose,
      offerId,
      fileName: file.name,
      contentType: file.type as ImageContentType,
      sizeBytes: file.size,
    }).pipe(
      switchMap((target) => {
        const headers = new HttpHeaders(
          Object.fromEntries(Object.entries(target.headers).map(([k, v]) => [k, String(v)])),
        );
        return this.http
          .request(target.method || 'PUT', target.uploadUrl, { body: file, headers })
          .pipe(map(() => target.key));
      }),
    );
  }
}
