import { OtpDeliveryDto } from 'data-access';

/**
 * Lo que el registro (o el login de una cuenta sin verificar) le pasa a la
 * verificación del correo (estado de la navegación). Sin `otp`, no se envió
 * un código nuevo: la persona puede pedirlo.
 */
export interface VerifyEmailState {
  readonly email: string;
  readonly otp: OtpDeliveryDto | null;
}

/** "j***@correo.com" (como lo enmascara la API al registrarse). */
export function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  return domain ? `${user.slice(0, 1)}***@${domain}` : email;
}
