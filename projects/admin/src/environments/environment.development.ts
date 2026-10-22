/** Configuración de desarrollo (`ng serve admin`). */
export const environment = {
  production: false,
  // Mismo origen: `ng serve` reenvía /api al backend (proxy.conf.mjs), porque
  // la API aún no responde a las peticiones CORS desde localhost.
  apiBaseUrl: '',
  /**
   * Sitio público donde viven las fichas de las ofertas ("Vista previa").
   * TODO(despliegue): definir el dominio; sin él no se muestra el enlace.
   */
  publicSiteUrl: null as string | null,
};
