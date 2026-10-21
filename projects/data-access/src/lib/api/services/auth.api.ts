import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import { publicRequest } from '../http-context';
import {
  AvailabilityResponseDto,
  ForgotPasswordRequestDto,
  LoginRequestDto,
  LoginResponseDto,
  LogoutRequestDto,
  OtpDeliveryDto,
  RefreshRequestDto,
  RegisterRequestDto,
  RegisterResponseDto,
  ResendOtpRequestDto,
  ResetPasswordRequestDto,
  ResetTokenResponseDto,
  TokenPairDto,
  VerifyEmailRequestDto,
  VerifyEmailResponseDto,
  VerifyResetOtpRequestDto,
} from '../models.generated';

/** Autenticación (todas las rutas son públicas). */
@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly api = inject(ApiClient);
  private readonly options = { context: publicRequest() };

  register(body: RegisterRequestDto) {
    return this.api.post<RegisterResponseDto>('/api/v1/auth/register', body, this.options);
  }

  availability(query: { readonly email?: string; readonly username?: string }) {
    return this.api.get<AvailabilityResponseDto>('/api/v1/auth/availability', {
      ...this.options,
      query,
    });
  }

  verifyEmail(body: VerifyEmailRequestDto) {
    return this.api.post<VerifyEmailResponseDto>('/api/v1/auth/verify-email', body, this.options);
  }

  resendOtp(body: ResendOtpRequestDto) {
    return this.api.post<OtpDeliveryDto>('/api/v1/auth/otp/resend', body, this.options);
  }

  login(body: LoginRequestDto) {
    return this.api.post<LoginResponseDto>('/api/v1/auth/login', body, this.options);
  }

  refresh(body: RefreshRequestDto) {
    return this.api.post<TokenPairDto>('/api/v1/auth/refresh', body, this.options);
  }

  logout(body: LogoutRequestDto) {
    return this.api.post<void>('/api/v1/auth/logout', body, this.options);
  }

  /** Recuperar contraseña — paso 1: enviar código. */
  forgotPassword(body: ForgotPasswordRequestDto) {
    return this.api.post<OtpDeliveryDto>('/api/v1/auth/password/forgot', body, this.options);
  }

  /** Recuperar contraseña — paso 2: verificar código. */
  verifyResetOtp(body: VerifyResetOtpRequestDto) {
    return this.api.post<ResetTokenResponseDto>(
      '/api/v1/auth/password/verify-otp',
      body,
      this.options,
    );
  }

  /** Recuperar contraseña — paso 3: nueva contraseña. */
  resetPassword(body: ResetPasswordRequestDto) {
    return this.api.post<void>('/api/v1/auth/password/reset', body, this.options);
  }
}
