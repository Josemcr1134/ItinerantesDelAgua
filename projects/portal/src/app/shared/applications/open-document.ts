import { inject } from '@angular/core';
import { ApplicationsApi, toApiError } from 'data-access';
import { firstValueFrom } from 'rxjs';
import { AlertService } from 'ui-kit';

/**
 * Abre un archivo propio de una postulación en otra pestaña con su URL
 * temporal. La pestaña se abre antes de pedir la URL para que el navegador no
 * la bloquee. Llamar en un contexto de inyección.
 */
export function documentOpener(): (applicationId: string, documentId: string) => Promise<void> {
  const api = inject(ApplicationsApi);
  const alerts = inject(AlertService);
  return async (applicationId, documentId) => {
    const tab = window.open('', '_blank');
    try {
      const access = await firstValueFrom(api.downloadDocument(applicationId, documentId));
      if (tab) {
        tab.opener = null;
        tab.location.href = access.url;
      } else {
        window.location.href = access.url;
      }
    } catch (error) {
      tab?.close();
      await alerts.error('No se pudo abrir el archivo', toApiError(error).message);
    }
  };
}
