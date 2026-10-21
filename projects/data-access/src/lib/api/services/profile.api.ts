import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import {
  ChangePasswordRequestDto,
  UpdateProfileRequestDto,
  UpdateTimezoneRequestDto,
  UserProfileDto,
} from '../models.generated';

/** Perfil del usuario autenticado. */
@Injectable({ providedIn: 'root' })
export class ProfileApi {
  private readonly api = inject(ApiClient);

  me() {
    return this.api.get<UserProfileDto>('/api/v1/me');
  }

  update(body: UpdateProfileRequestDto) {
    return this.api.patch<UserProfileDto>('/api/v1/me', body);
  }

  updateTimezone(body: UpdateTimezoneRequestDto) {
    return this.api.patch<UserProfileDto>('/api/v1/me/timezone', body);
  }

  changePassword(body: ChangePasswordRequestDto) {
    return this.api.post<void>('/api/v1/me/password', body);
  }
}
