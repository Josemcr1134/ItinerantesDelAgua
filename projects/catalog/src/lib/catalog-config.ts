import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';
import { OfferActionType } from 'data-access';

/**
 * Destino de una acción de la ficha (inscribirse, pagar, postular…): una URL
 * de otra app (`href`, p. ej. la landing hacia el Portal) o una ruta de la
 * misma app (`route` + `queryParams`, sin recargar la página).
 */
export type CatalogActionLink =
  | { readonly href: string }
  | {
      readonly route: readonly string[];
      readonly queryParams: Readonly<Record<string, string>>;
    };

export interface CatalogConfig {
  /** Ruta del catálogo en la app; la ficha es `{catalogPath}/:slug`. */
  readonly catalogPath: string;
  /** A dónde lleva cada acción de la ficha. */
  readonly actionLink: (slug: string, action: OfferActionType) => CatalogActionLink;
  /** "Te pediremos iniciar sesión…" bajo las acciones (sin sesión, en la landing). */
  readonly loginHint: boolean;
}

export const CATALOG_CONFIG = new InjectionToken<CatalogConfig>('CATALOG_CONFIG', {
  factory: () => ({
    catalogPath: '/escuela/oferta',
    actionLink: () => ({ href: '#' }),
    loginHint: true,
  }),
});

/** Configura el catálogo y la ficha de la oferta en una app. */
export function provideCatalog(config: CatalogConfig): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: CATALOG_CONFIG, useValue: config }]);
}
