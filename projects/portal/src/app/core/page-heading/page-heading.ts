import { DestroyRef, inject, Injectable, signal } from '@angular/core';

/** Paso de la ruta de migas: con `link`, enlaza; sin él, es la página actual. */
export interface Crumb {
  readonly label: string;
  readonly link?: string;
  readonly queryParams?: Readonly<Record<string, string>>;
}

export interface Heading {
  readonly title: string;
  readonly subtitle?: string | null;
  /** Migas bajo el título (Figma: "Becas › Becas disponibles › …"). */
  readonly breadcrumb?: readonly Crumb[];
}

/** Título del encabezado si la página no pone el suyo (Figma HU-06). */
export const DEFAULT_HEADING: Heading = { title: 'Escuela Itinerante del Agua' };

/**
 * Título y subtítulo del encabezado del portal: el marco los muestra y cada
 * página pone los suyos (p. ej. "Formación" · "Diplomados en los que estoy
 * inscrito"). Al salir de la página vuelve al título por defecto.
 */
@Injectable({ providedIn: 'root' })
export class PageHeading {
  private readonly state = signal<Heading>(DEFAULT_HEADING);
  readonly current = this.state.asReadonly();

  set(heading: Heading): void {
    this.state.set(heading);
  }

  reset(): void {
    this.state.set(DEFAULT_HEADING);
  }
}

/** Pone el encabezado de la página y lo restablece al destruirla (contexto de inyección). */
export function usePageHeading(): PageHeading {
  const heading = inject(PageHeading);
  inject(DestroyRef).onDestroy(() => heading.reset());
  return heading;
}
