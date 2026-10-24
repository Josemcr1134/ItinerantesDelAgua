/** Configuración de desarrollo (`ng serve public-site`). */
export const environment = {
  production: false,
  // Directo a Railway: la API permite CORS desde localhost:4200, 4201 y 4202
  // (levantar en uno de esos puertos).
  apiBaseUrl: 'https://itinerantes-backend-production.up.railway.app',
  /** Portal de participantes (`npm run start:portal`). */
  portalUrl: 'http://localhost:4201' as string | null,
};
