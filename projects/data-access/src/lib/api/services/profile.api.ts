import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import { ApiBody, ApiResponse } from '../operations.generated';

/** Perfil del usuario autenticado. */
@Injectable({ providedIn: 'root' })
export class ProfileApi {
  private readonly api = inject(ApiClient);

  me() {
    return this.api.get<ApiResponse<'Me_getMe'>>('/api/v1/me');
  }

  update(body: ApiBody<'Me_updateMe'>) {
    return this.api.patch<ApiResponse<'Me_updateMe'>>('/api/v1/me', body);
  }

  updateTimezone(body: ApiBody<'Me_updateTimezone'>) {
    return this.api.patch<ApiResponse<'Me_updateTimezone'>>('/api/v1/me/timezone', body);
  }

  changePassword(body: ApiBody<'AccountSecurity_changePassword'>) {
    return this.api.post<ApiResponse<'AccountSecurity_changePassword'>>(
      '/api/v1/me/password',
      body,
    );
  }
}
