import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import { publicRequest, silentRequest } from '../http-context';
import { ApiResponse } from '../operations.generated';

/** Estado del servicio (rutas públicas, sin loader general). */
@Injectable({ providedIn: 'root' })
export class HealthApi {
  private readonly api = inject(ApiClient);
  private readonly options = { context: silentRequest(publicRequest()) };

  liveness() {
    return this.api.get<ApiResponse<'Health_liveness'>>('/api/v1/health', this.options);
  }

  readiness() {
    return this.api.get<ApiResponse<'Health_readiness'>>('/api/v1/health/ready', this.options);
  }
}
