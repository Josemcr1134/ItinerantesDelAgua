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
};

const DEFAULT_TITLE = 'Algo salió mal';

/** Errores que no se deben a la persona: avisan con tono de advertencia. */
const WARNING_CODES: readonly ApiErrorCode[] = [
  'VALIDATION_ERROR',
  'CONFLICT',
  'BUSINESS_RULE_VIOLATION',
  'RATE_LIMITED',
  'PAYLOAD_TOO_LARGE',
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
