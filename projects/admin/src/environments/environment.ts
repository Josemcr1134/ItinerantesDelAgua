/** Configuración de producción del administrador. */
export const environment = {
  production: true,
  apiBaseUrl: 'https://itinerantes-backend-production.up.railway.app',
  /**
   * Sitio público donde viven las fichas de las ofertas ("Vista previa").
   * TODO(despliegue): definir el dominio; sin él no se muestra el enlace.
   */
  publicSiteUrl: null as string | null,
};
