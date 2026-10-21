import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import { DashboardDto } from '../models.generated';

/** Dashboard del usuario. */
@Injectable({ providedIn: 'root' })
export class DashboardApi {
  private readonly api = inject(ApiClient);

  get() {
    return this.api.get<DashboardDto>('/api/v1/me/dashboard');
  }
}
