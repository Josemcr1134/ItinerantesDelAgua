import { inject } from '@angular/core';
import { LibraryApi, LibraryItemDto } from 'data-access';
import { tabOpener } from '../../shared/open-in-tab';

/** Abre un recurso de la biblioteca con su URL firmada (HU-09). Llamar en un contexto de inyección. */
export function resourceOpener(): (item: Pick<LibraryItemDto, 'id'>) => Promise<void> {
  const library = inject(LibraryApi);
  const open = tabOpener();
  return (item) => open(library.access(item.id), 'No se pudo abrir el recurso');
}
