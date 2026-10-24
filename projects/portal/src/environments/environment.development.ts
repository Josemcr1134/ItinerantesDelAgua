/** Configuración de desarrollo (`ng serve portal`). */
export const environment = {
  production: false,
  // Directo a Railway: la API permite CORS desde localhost:4200, 4201 y 4202
  // (levantar en uno de esos puertos).
  apiBaseUrl: 'https://itinerantes-backend-production.up.railway.app',
  /** La URL canónica apunta siempre al dominio de producción. */
  siteUrl: 'https://portal.itinerantesdelagua.com',
};
