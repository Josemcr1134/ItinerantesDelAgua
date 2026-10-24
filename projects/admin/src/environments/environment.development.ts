/** Configuración de desarrollo (`ng serve admin`). */
export const environment = {
  production: false,
  // Directo a Railway: la API permite CORS desde localhost:4200, 4201 y 4202
  // (levantar en uno de esos puertos).
  apiBaseUrl: 'https://itinerantes-backend-production.up.railway.app',
  /**
   * Sitio público donde viven las fichas de las ofertas ("Vista previa").
   * TODO(landing): activar con `https://itinerantesdelagua.com` (o localhost:4200
   * en desarrollo) cuando la landing tenga las fichas `/escuela/oferta/:slug`;
   * hoy solo tiene la portada. Sin dominio no se muestra el enlace.
   */
  publicSiteUrl: null as string | null,
};
