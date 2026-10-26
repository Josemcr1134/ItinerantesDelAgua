import { inject } from '@angular/core';
import { ApplicationsApi } from 'data-access';
import { tabOpener } from '../open-in-tab';

/** Abre un archivo propio de una postulación con su URL temporal. Llamar en un contexto de inyección. */
export function documentOpener(): (applicationId: string, documentId: string) => Promise<void> {
  const api = inject(ApplicationsApi);
  const open = tabOpener();
  return (applicationId, documentId) =>
    open(api.downloadDocument(applicationId, documentId), 'No se pudo abrir el archivo');
}
