import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { toApiError } from './api-error';

/** Normaliza todos los errores HTTP a `ApiError` para el resto de la aplicación. */
export const apiErrorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(catchError((error: unknown) => throwError(() => toApiError(error))));
