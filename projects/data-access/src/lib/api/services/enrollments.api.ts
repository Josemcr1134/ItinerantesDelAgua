import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import { ApiBody, ApiQuery, ApiResponse } from '../operations.generated';

/** Mi formación. */
@Injectable({ providedIn: 'root' })
export class EnrollmentsApi {
  private readonly api = inject(ApiClient);

  mine(query: ApiQuery<'Enrollments_list'> = {}) {
    return this.api.get<ApiResponse<'Enrollments_list'>>('/api/v1/me/enrollments', {
      query: { ...query },
    });
  }

  /** Inscribirme en una oferta gratuita. */
  enrollFree(body: ApiBody<'Enrollments_enroll'>) {
    return this.api.post<ApiResponse<'Enrollments_enroll'>>('/api/v1/me/enrollments', body);
  }
}
