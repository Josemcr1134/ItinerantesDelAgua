import { HttpErrorResponse } from '@angular/common/http';
import { ErrorCode, ErrorDetailDto, ErrorResponseDto } from './models.generated';

/** Código de error estable de la API (ver docs/frontend/errores.md del backend). */
export type ApiErrorCode = ErrorCode | 'NETWORK_ERROR' | 'UNKNOWN_ERROR';

/** Origen del error: respuesta de la API, sin conexión o inesperado. */
export type ApiErrorKind = 'http' | 'network' | 'unknown';

/**
 * Error normalizado de cualquier petición. Sigue el formato único de la API
 * (`statusCode`, `code`, `message`, `details`, `requestId`) y cubre también los
 * fallos de red y los inesperados, para presentarlos siempre igual.
 */
export class ApiError extends Error {
  override readonly name = 'ApiError';

  constructor(
    readonly kind: ApiErrorKind,
    readonly statusCode: number,
    readonly code: ApiErrorCode,
    message: string,
    readonly details: readonly ErrorDetailDto[] = [],
    readonly requestId: string | null = null,
    /** Datos extra según el código (`lockedUntil`, `attemptsRemaining`…). */
    readonly meta: Readonly<Record<string, unknown>> = {},
  ) {
    super(message);
  }

  /** Errores por campo, indexados por nombre (`email`, `phone.number`…). */
  fieldErrors(): Readonly<Record<string, string>> {
    return Object.fromEntries(this.details.map((d) => [d.field, d.message]));
  }

  /** Lee un dato de `meta` como texto (p. ej. una fecha ISO). */
  metaString(key: string): string | null {
    const value = this.meta[key];
    return typeof value === 'string' ? value : null;
  }

  /** Lee un dato de `meta` como número (p. ej. `attemptsRemaining`). */
  metaNumber(key: string): number | null {
    const value = this.meta[key];
    return typeof value === 'number' ? value : null;
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

const NETWORK_MESSAGE =
  'No pudimos conectarnos con el servidor. Revisa tu conexión a internet e inténtalo de nuevo.';
const UNKNOWN_MESSAGE = 'Ocurrió un error inesperado. Inténtalo de nuevo en unos minutos.';

const isErrorBody = (body: unknown): body is ErrorResponseDto =>
  typeof body === 'object' &&
  body !== null &&
  typeof (body as ErrorResponseDto).code === 'string' &&
  typeof (body as ErrorResponseDto).message === 'string';

/** Convierte cualquier error (HTTP, red, excepción) en un `ApiError`. */
export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return new ApiError('network', 0, 'NETWORK_ERROR', NETWORK_MESSAGE);
    }
    const requestId = error.headers?.get('X-Request-Id') ?? null;
    if (isErrorBody(error.error)) {
      const body = error.error;
      return new ApiError(
        'http',
        body.statusCode ?? error.status,
        body.code,
        body.message,
        body.details ?? [],
        body.requestId ?? requestId,
        body.meta ?? {},
      );
    }
    const code = error.status >= 500 ? 'INTERNAL_ERROR' : 'UNKNOWN_ERROR';
    return new ApiError('http', error.status, code, UNKNOWN_MESSAGE, [], requestId);
  }
  return new ApiError('unknown', 0, 'UNKNOWN_ERROR', UNKNOWN_MESSAGE);
}
