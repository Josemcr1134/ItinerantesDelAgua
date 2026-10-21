import { inject, Injectable } from '@angular/core';
import { ApiClient, PageQuery, Paginated } from '../api-client';
import {
  AccessUrlDto,
  ClassroomDto,
  ConfirmFinalProjectRequestDto,
  FinalProjectDto,
  FinalProjectUploadRequestDto,
  MaterialsDto,
  SessionCardDto,
  UploadUrlDto,
} from '../models.generated';
import { SessionsQuery } from './sessions.api';

/** Aula de una formación. */
@Injectable({ providedIn: 'root' })
export class ClassroomsApi {
  private readonly api = inject(ApiClient);

  private path(offerId: string): string {
    return `/api/v1/me/classrooms/${encodeURIComponent(offerId)}`;
  }

  classroom(offerId: string) {
    return this.api.get<ClassroomDto>(this.path(offerId));
  }

  materials(offerId: string) {
    return this.api.get<MaterialsDto>(`${this.path(offerId)}/materials`);
  }

  /** URL temporal para abrir / descargar un recurso. */
  resourceAccess(offerId: string, resourceId: string) {
    return this.api.get<AccessUrlDto>(
      `${this.path(offerId)}/resources/${encodeURIComponent(resourceId)}/access`,
    );
  }

  sessions(offerId: string, query: PageQuery & Pick<SessionsQuery, 'scope'> = {}) {
    return this.api.get<Paginated<SessionCardDto>>(`${this.path(offerId)}/sessions`, {
      query: { ...query },
    });
  }

  /** Proyecto final: pedir URL de carga. */
  finalProjectUploadUrl(offerId: string, body: FinalProjectUploadRequestDto) {
    return this.api.post<UploadUrlDto>(`${this.path(offerId)}/final-project/upload-url`, body);
  }

  /** Proyecto final: confirmar entrega. */
  confirmFinalProject(offerId: string, body: ConfirmFinalProjectRequestDto) {
    return this.api.put<FinalProjectDto>(`${this.path(offerId)}/final-project`, body);
  }

  /** Proyecto final: descargar mi entrega. */
  finalProjectDownload(offerId: string) {
    return this.api.get<AccessUrlDto>(`${this.path(offerId)}/final-project/download`);
  }
}
