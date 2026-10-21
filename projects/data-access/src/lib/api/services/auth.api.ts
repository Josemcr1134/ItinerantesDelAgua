import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import { publicRequest } from '../http-context';
import { ApiBody, ApiQuery, ApiResponse } from '../operations.generated';

/** Autenticación (todas las rutas son públicas). */
@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly api = inject(ApiClient);
  private readonly options = { context: publicRequest() };

  register(body: ApiBody<'Auth_register'>) {
    return this.api.post<ApiResponse<'Auth_register'>>('/api/v1/auth/register', body, this.options);
  }

  availability(query: ApiQuery<'Auth_availability'>) {
    return this.api.get<ApiResponse<'Auth_availability'>>('/api/v1/auth/availability', {
      ...this.options,
      query: { ...query },
    });
  }

  verifyEmail(body: ApiBody<'Auth_verifyEmail'>) {
    return this.api.post<ApiResponse<'Auth_verifyEmail'>>(
      '/api/v1/auth/verify-email',
      body,
      this.options,
    );
  }

  resendOtp(body: ApiBody<'Auth_resendOtp'>) {
    return this.api.post<ApiResponse<'Auth_resendOtp'>>(
      '/api/v1/auth/otp/resend',
      body,
      this.options,
    );
  }

  login(body: ApiBody<'Auth_login'>) {
    return this.api.post<ApiResponse<'Auth_login'>>('/api/v1/auth/login', body, this.options);
  }

  refresh(body: ApiBody<'Auth_refresh'>) {
    return this.api.post<ApiResponse<'Auth_refresh'>>('/api/v1/auth/refresh', body, this.options);
  }

  logout(body: ApiBody<'Auth_logout'>) {
    return this.api.post<ApiResponse<'Auth_logout'>>('/api/v1/auth/logout', body, this.options);
  }

  /** Recuperar contraseña — paso 1: enviar código. */
  forgotPassword(body: ApiBody<'Auth_forgotPassword'>) {
    return this.api.post<ApiResponse<'Auth_forgotPassword'>>(
      '/api/v1/auth/password/forgot',
      body,
      this.options,
    );
  }

  /** Recuperar contraseña — paso 2: verificar código. */
  verifyResetOtp(body: ApiBody<'Auth_verifyResetOtp'>) {
    return this.api.post<ApiResponse<'Auth_verifyResetOtp'>>(
      '/api/v1/auth/password/verify-otp',
      body,
      this.options,
    );
  }

  /** Recuperar contraseña — paso 3: nueva contraseña. */
  resetPassword(body: ApiBody<'Auth_resetPassword'>) {
    return this.api.post<ApiResponse<'Auth_resetPassword'>>(
      '/api/v1/auth/password/reset',
      body,
      this.options,
    );
  }
}
