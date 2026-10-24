/** Configuración de producción del administrador. */
export const environment = {
  production: true,
  apiBaseUrl: 'https://itinerantes-backend-production.up.railway.app',
  /**
   * Sitio público donde viven las fichas de las ofertas ("Vista previa").
   * TODO(landing): activar con `https://itinerantesdelagua.com` (o localhost:4200
   * en desarrollo) cuando la landing tenga las fichas `/escuela/oferta/:slug`;
   * hoy solo tiene la portada. Sin dominio no se muestra el enlace.
   */
  publicSiteUrl: null as string | null,
};
