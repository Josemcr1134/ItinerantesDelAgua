import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import { ApiResponse } from '../operations.generated';

/** Dashboard del usuario. */
@Injectable({ providedIn: 'root' })
export class DashboardApi {
  private readonly api = inject(ApiClient);

  get() {
    return this.api.get<ApiResponse<'Dashboard_get'>>('/api/v1/me/dashboard');
  }
}
