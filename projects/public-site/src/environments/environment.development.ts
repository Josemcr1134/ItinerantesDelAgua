/** Configuración de desarrollo (`ng serve public-site`). */
export const environment = {
  production: false,
  // Mismo origen: `ng serve` reenvía /api al backend (proxy.conf.mjs), porque
  // la API aún no responde a las peticiones CORS desde localhost.
  apiBaseUrl: '',
};
