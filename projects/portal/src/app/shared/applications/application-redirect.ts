import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApplicationsApi } from 'data-access';
import { catchError, map, of } from 'rxjs';

/**
 * `/postulaciones/:id` (enlaces de notificaciones y correos): lleva a la
 * postulación en Becas o en Convocatorias según su tipo. Si no se encuentra,
 * a "Mis postulaciones" de Convocatorias.
 */
export const applicationRedirect: CanActivateFn = (route) => {
  const router = inject(Router);
  const id = route.paramMap.get('id') ?? '';
  return inject(ApplicationsApi)
    .get(id)
    .pipe(
      map((application) =>
        application.kind === 'SCHOLARSHIP'
          ? router.createUrlTree(['/becas', id])
          : router.createUrlTree(['/convocatorias'], {
              queryParams: { pestana: 'postulaciones', postulacion: id },
            }),
      ),
      catchError(() =>
        of(router.createUrlTree(['/convocatorias'], { queryParams: { pestana: 'postulaciones' } })),
      ),
    );
};
