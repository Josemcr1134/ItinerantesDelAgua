import { inject } from '@angular/core';
import { LibraryApi, LibraryItemDto, toApiError } from 'data-access';
import { firstValueFrom } from 'rxjs';
import { AlertService } from 'ui-kit';

/**
 * Abre un recurso de la biblioteca en otra pestaña con su URL firmada
 * (HU-09). La pestaña se abre antes de pedir la URL para que el navegador no
 * la bloquee. Llamar en un contexto de inyección.
 */
export function resourceOpener(): (item: Pick<LibraryItemDto, 'id'>) => Promise<void> {
  const library = inject(LibraryApi);
  const alerts = inject(AlertService);
  return async (item) => {
    const tab = window.open('', '_blank');
    try {
      const access = await firstValueFrom(library.access(item.id));
      if (tab) {
        tab.opener = null;
        tab.location.href = access.url;
      } else {
        window.location.href = access.url;
      }
    } catch (error) {
      tab?.close();
      await alerts.error('No se pudo abrir el recurso', toApiError(error).message);
    }
  };
}
