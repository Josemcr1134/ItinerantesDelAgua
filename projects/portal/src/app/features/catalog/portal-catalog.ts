import { CatalogConfig } from 'catalog';

/**
 * Catálogo dentro del Portal: las fichas en `/catalogo/:slug` y las acciones
 * (inscribirse, pagar, postular…) en `/inscripcion/:slug`, sin salir de la
 * plataforma. Ya hay sesión: no se avisa que hay que iniciarla.
 */
export const PORTAL_CATALOG: CatalogConfig = {
  catalogPath: '/catalogo',
  actionLink: (slug, action) => ({
    route: ['/inscripcion', slug],
    queryParams: { accion: action },
  }),
  loginHint: false,
};

/** Ficha de una oferta en el Portal. */
export const offerPath = (slug: string) =>
  `${PORTAL_CATALOG.catalogPath}/${encodeURIComponent(slug)}`;
