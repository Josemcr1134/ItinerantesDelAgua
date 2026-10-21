import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { SKIP_GLOBAL_LOADER } from './http-context';
import { LoadingService } from './loading.service';

/** Cuenta las peticiones en curso (salvo las marcadas con `SKIP_GLOBAL_LOADER`). */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_GLOBAL_LOADER)) {
    return next(req);
  }
  const loading = inject(LoadingService);
  loading.start();
  return next(req).pipe(finalize(() => loading.stop()));
};
