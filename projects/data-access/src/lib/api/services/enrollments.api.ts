import { inject, Injectable } from '@angular/core';
import { ApiClient, PageQuery, Paginated } from '../api-client';
import { CreateEnrollmentRequestDto, FormationCardDto } from '../models.generated';
import { OfferType } from './offers.api';

export interface EnrollmentsQuery extends PageQuery {
  readonly type?: readonly OfferType[];
  readonly phase?: 'ACTIVE' | 'COMPLETED' | 'ALL';
}

/** Mi formación. */
@Injectable({ providedIn: 'root' })
export class EnrollmentsApi {
  private readonly api = inject(ApiClient);

  mine(query: EnrollmentsQuery = {}) {
    return this.api.get<Paginated<FormationCardDto>>('/api/v1/me/enrollments', {
      query: { ...query },
    });
  }

  /** Inscribirme en una oferta gratuita. */
  enrollFree(body: CreateEnrollmentRequestDto) {
    return this.api.post<FormationCardDto>('/api/v1/me/enrollments', body);
  }
}
