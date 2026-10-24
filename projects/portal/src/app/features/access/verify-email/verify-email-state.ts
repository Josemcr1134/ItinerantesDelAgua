import { OtpDeliveryDto } from 'data-access';

/** Lo que el registro le pasa a la verificación del correo (estado de la navegación). */
export interface VerifyEmailState {
  readonly email: string;
  readonly otp: OtpDeliveryDto;
}
