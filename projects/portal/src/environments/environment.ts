import { HttpInterceptorFn } from '@angular/common/http';

/** Configuración de producción del portal de participantes. */
export const environment = {
  production: true,
  apiBaseUrl: 'https://itinerantes-backend-production.up.railway.app',
  /** Dominio público del portal (URL canónica y metadatos para compartir). */
  siteUrl: 'https://portal.itinerantesdelagua.com',
  /** Landing (catálogo y fichas de la oferta). */
  landingUrl: 'https://itinerantesdelagua.com',
  /** Interceptores de desarrollo (datos de prueba): ninguno en producción. */
  devInterceptors: [] as readonly HttpInterceptorFn[],
};
