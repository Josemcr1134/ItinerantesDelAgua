import { OtpDeliveryDto } from 'data-access';

/**
 * Contraseña correcta pero cuenta sin verificar (`AUTH_EMAIL_NOT_VERIFIED`):
 * datos de `error.meta` para llevar a validar el correo (HU-03). `otpSent`: la
 * API reenvió el código (si el tiempo de espera lo permitía).
 */
export interface UnverifiedLogin {
  readonly email: string;
  /** "Recordarme" del intento, para la sesión que se inicia al verificar. */
  readonly rememberMe: boolean;
  readonly otpSent: boolean;
  /** Correo enmascarado por la API ("a***@correo.com"). */
  readonly maskedEmail: string | null;
  readonly codeLength: number;
  readonly expiresAt: string | null;
  readonly resendAvailableAt: string | null;
}

/**
 * Lo que el registro (o el login de una cuenta sin verificar) le pasa a la
 * verificación del correo (estado de la navegación). Sin `otp`, no se envió
 * un código nuevo: la persona puede pedirlo desde `resendAvailableAt`.
 */
export interface VerifyEmailState {
  readonly email: string;
  readonly otp: OtpDeliveryDto | null;
  readonly maskedEmail?: string | null;
  readonly rememberMe?: boolean;
  readonly resendAvailableAt?: string | null;
}

/** "j***@correo.com" (como lo enmascara la API), si la API no lo envió. */
export function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  return domain ? `${user.slice(0, 1)}***@${domain}` : email;
}

/** Estado de la verificación a partir del login rechazado. */
export function verifyEmailState(login: UnverifiedLogin): VerifyEmailState {
  const maskedEmail = login.maskedEmail ?? maskEmail(login.email);
  return {
    email: login.email,
    maskedEmail,
    rememberMe: login.rememberMe,
    resendAvailableAt: login.resendAvailableAt,
    otp:
      login.otpSent && login.expiresAt
        ? {
            maskedEmail,
            codeLength: login.codeLength,
            expiresAt: login.expiresAt,
            resendAvailableAt: login.resendAvailableAt ?? login.expiresAt,
          }
        : null,
  };
}
