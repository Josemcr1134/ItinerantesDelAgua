import { inject } from '@angular/core';
import { toApiError } from 'data-access';
import { firstValueFrom, Observable } from 'rxjs';
import { AlertService } from 'ui-kit';

/**
 * Abre en otra pestaña una URL que se pide a la API (URL firmada o enlace
 * externo). La pestaña se abre antes de pedirla para que el navegador no la
 * bloquee; si falla, se cierra y se avisa. Llamar en un contexto de inyección.
 */
export function tabOpener(): (
  request: Observable<{ readonly url: string }>,
  errorTitle: string,
) => Promise<void> {
  const alerts = inject(AlertService);
  return async (request, errorTitle) => {
    const tab = window.open('', '_blank');
    try {
      const { url } = await firstValueFrom(request);
      if (tab) {
        tab.opener = null;
        tab.location.href = url;
      } else {
        window.location.href = url;
      }
    } catch (error) {
      tab?.close();
      await alerts.error(errorTitle, toApiError(error).message);
    }
  };
}
