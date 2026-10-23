import { inject, Injectable } from '@angular/core';
import { ApiError, ApiErrorCode, toApiError } from 'data-access';
import { AlertService, AlertVariant } from 'ui-kit';
import { catchError, EMPTY, MonoTypeOperatorFunction } from 'rxjs';

/** Título de la alerta según el código de error de la API. */
const TITLES: Partial<Record<ApiErrorCode, string>> = {
  NETWORK_ERROR: 'Sin conexión',
  VALIDATION_ERROR: 'Revisa los datos',
  BAD_REQUEST: 'Solicitud no válida',
  UNAUTHORIZED: 'Tu sesión terminó',
  FORBIDDEN: 'Acceso restringido',
  NOT_FOUND: 'No encontrado',
  CONFLICT: 'Hay un conflicto',
  PAYLOAD_TOO_LARGE: 'Archivo demasiado grande',
  BUSINESS_RULE_VIOLATION: 'No es posible continuar',
  RATE_LIMITED: 'Demasiados intentos',
  SERVICE_UNAVAILABLE: 'Servicio no disponible',
  INTERNAL_ERROR: 'Algo salió mal',
  ADMIN_SELF_ACTION: 'No puedes hacerlo sobre tu cuenta',
  ADMIN_LAST_SUPER_ADMIN: 'Se necesita un superadministrador',
  OFFER_NAME_TAKEN: 'Ese nombre ya existe',
  OFFER_HAS_ENROLLMENTS: 'La oferta ya tiene inscritos',
  OFFER_INVALID_STATE: 'No es posible en este estado',
  OFFER_INCOMPLETE: 'Faltan datos para publicar',
  ADMIN_UPLOAD_NOT_FOUND: 'No encontramos la imagen',
  ADMIN_UPLOAD_INVALID_FILE: 'Imagen no válida',
  TEACHER_IN_USE: 'El docente está en uso',
  APPLICATION_INVALID_STATE: 'No es posible en este estado',
  APPLICATION_INTERVIEW_REQUIRED: 'Falta la entrevista',
  NOTIFICATION_EMAIL_NOT_FAILED: 'El correo ya se envió',
  FOLLOW_UP_REMINDER_TOO_SOON: 'Aún no se puede recordar',
  FOLLOW_UP_PHONE_INVALID: 'Teléfono no válido',
  SESSION_CONFLICT: 'Se cruza con otra sesión',
  SESSION_CANCELLED: 'La sesión está cancelada',
  SESSION_HAS_ATTENDANCE: 'La sesión tiene asistencias',
  SESSION_GENERATION_BLOCKED: 'No se pueden crear las sesiones',
  ATTENDANCE_NOT_ENROLLED: 'Sin inscripción vigente',
  ATTENDANCE_NOT_OPEN_YET: 'El registro aún no abre',
  ATTENDANCE_WINDOW_CLOSED: 'El registro ya cerró',
  PAYMENT_INVALID_STATE: 'El pago ya cambió de estado',
  PAYMENT_REFUND_INVALID: 'Reembolso no válido',
  PAYMENT_TRANSFER_AMOUNT_MISMATCH: 'El monto no coincide',
  PAYMENT_PLAN_INVALID_STATE: 'No es posible en este estado del plan',
  PAYMENT_CHARGE_FAILED: 'El cobro fue rechazado',
  PAYMENT_PROVIDER_ERROR: 'Stripe no respondió',
  PAYMENTS_NOT_CONFIGURED: 'Pagos sin configurar',
};

const DEFAULT_TITLE = 'Algo salió mal';

/** Errores que no se deben a la persona: avisan con tono de advertencia. */
const WARNING_CODES: readonly ApiErrorCode[] = [
  'VALIDATION_ERROR',
  'CONFLICT',
  'BUSINESS_RULE_VIOLATION',
  'RATE_LIMITED',
  'PAYLOAD_TOO_LARGE',
  'ADMIN_SELF_ACTION',
  'ADMIN_LAST_SUPER_ADMIN',
  'OFFER_NAME_TAKEN',
  'OFFER_HAS_ENROLLMENTS',
  'OFFER_INVALID_STATE',
  'OFFER_INCOMPLETE',
  'ADMIN_UPLOAD_INVALID_FILE',
  'TEACHER_IN_USE',
  'APPLICATION_INVALID_STATE',
  'APPLICATION_INTERVIEW_REQUIRED',
  'NOTIFICATION_EMAIL_NOT_FAILED',
  'FOLLOW_UP_REMINDER_TOO_SOON',
  'FOLLOW_UP_PHONE_INVALID',
  'SESSION_CONFLICT',
  'SESSION_CANCELLED',
  'SESSION_HAS_ATTENDANCE',
  'SESSION_GENERATION_BLOCKED',
  'ATTENDANCE_NOT_ENROLLED',
  'ATTENDANCE_NOT_OPEN_YET',
  'ATTENDANCE_WINDOW_CLOSED',
  'PAYMENT_INVALID_STATE',
  'PAYMENT_REFUND_INVALID',
  'PAYMENT_TRANSFER_AMOUNT_MISMATCH',
  'PAYMENT_PLAN_INVALID_STATE',
  'PAYMENT_CHARGE_FAILED',
];

export interface PresentErrorOptions {
  /** Título propio; por defecto, el del código de error. */
  readonly title?: string;
  /** Mensaje propio; por defecto, el que envía la API. */
  readonly message?: string;
}

/**
 * Presenta cualquier error de petición como un modal de alerta: elige título,
 * ilustración y tono según el `ApiError` y muestra los errores por campo y el
 * código de referencia para soporte.
 */
@Injectable({ providedIn: 'root' })
export class ErrorPresenter {
  private readonly alerts = inject(AlertService);

  present(error: unknown, options: PresentErrorOptions = {}): Promise<boolean> {
    const apiError = toApiError(error);
    return this.alerts.open({
      variant: this.variantFor(apiError),
      title: options.title ?? TITLES[apiError.code] ?? DEFAULT_TITLE,
      message: options.message ?? apiError.message,
      details: apiError.details.map((d) => d.message),
      reference: apiError.requestId,
      confirmLabel: 'Entendido',
    });
  }

  /**
   * Operador RxJS: presenta el error y completa el flujo sin propagarlo.
   *
   * ```ts
   * this.api.list().pipe(errors.handle()).subscribe(...)
   * ```
   */
  handle<T>(options?: PresentErrorOptions): MonoTypeOperatorFunction<T> {
    return catchError((error: unknown) => {
      void this.present(error, options);
      return EMPTY;
    });
  }

  private variantFor(error: ApiError): AlertVariant {
    if (error.kind === 'network') {
      return 'network';
    }
    return WARNING_CODES.includes(error.code) ? 'warning' : 'error';
  }
}
