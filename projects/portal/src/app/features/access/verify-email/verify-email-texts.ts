import { AUTH_TEXTS } from 'auth';

/** Textos de la verificación del correo (Figma HU-03). */
export const VERIFY_TEXTS = {
  title: 'Verifica tu Correo',
  sent: (email: string) => `Enviamos un código a ${email}`,
  /** Sin el estado del registro (p. ej. al recargar) se pide el correo. */
  askEmail: 'Escribe tu correo y el código que te enviamos.',
  codeLabel: AUTH_TEXTS.forgot.code.label,
  resendIn: 'Reenviar código en',
  resend: AUTH_TEXTS.forgot.code.resend,
  resent: AUTH_TEXTS.forgot.code.resent,
  submit: 'Verificar',
  submitting: 'Verificando…',
  notYourEmail: '¿No es tu correo?',
  backToRegister: 'Volver al Registro',
  // TODO(contenido): confirmar el mensaje de cuenta verificada.
  done: { title: 'Correo verificado', message: 'Ya puedes iniciar sesión.' },
} as const;

/** Segundos como "00:25" (Figma). */
export const formatClock = (total: number): string =>
  `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
