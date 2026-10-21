import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import { publicRequest, silentRequest } from '../http-context';
import { HealthResponseDto, ReadinessResponseDto } from '../models.generated';

/** Estado del servicio (rutas públicas, sin loader general). */
@Injectable({ providedIn: 'root' })
export class HealthApi {
  private readonly api = inject(ApiClient);

  liveness() {
    return this.api.get<HealthResponseDto>('/api/v1/health', {
      context: silentRequest(publicRequest()),
    });
  }

  readiness() {
    return this.api.get<ReadinessResponseDto>('/api/v1/health/ready', {
      context: silentRequest(publicRequest()),
    });
  }
}
