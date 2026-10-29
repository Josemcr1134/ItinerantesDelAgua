/** Configuración de desarrollo (`ng serve admin`). */
export const environment = {
  production: false,
  // Directo a Railway: la API permite CORS desde localhost:4200, 4201 y 4202
  // (levantar en uno de esos puertos).
  apiBaseUrl: 'https://itinerantes-backend-production.up.railway.app',
  /**
   * Sitio público donde viven las fichas de las ofertas ("Vista previa"). En
   * local, la landing con `npm run start:landing`.
   */
  publicSiteUrl: 'http://localhost:4200' as string | null,
};
