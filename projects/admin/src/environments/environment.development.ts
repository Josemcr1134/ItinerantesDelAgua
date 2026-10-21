/** Configuración de desarrollo (`ng serve admin`). */
export const environment = {
  production: false,
  // Mismo origen: `ng serve` reenvía /api al backend (proxy.conf.json), porque
  // la API aún no responde a las peticiones CORS desde localhost.
  apiBaseUrl: '',
};
