import { HttpInterceptorFn } from '@angular/common/http';
import { mockFormationInterceptor } from '../app/dev/mock-formation/mock-formation.interceptor';

/** Configuración de desarrollo (`ng serve portal`). */
export const environment = {
  production: false,
  // Directo a Railway: la API permite CORS desde localhost:4200, 4201 y 4202
  // (levantar en uno de esos puertos).
  apiBaseUrl: 'https://itinerantes-backend-production.up.railway.app',
  /** La URL canónica apunta siempre al dominio de producción. */
  siteUrl: 'https://portal.itinerantesdelagua.com',
  /** Landing (catálogo y fichas de la oferta), en local con `ng serve public-site`. */
  landingUrl: 'http://localhost:4200',
  /**
   * Solo desarrollo: datos de prueba de "Formación" y el aula, con
   * `?mock=formacion` (se recuerda en el navegador; `?mock=off` lo apaga).
   */
  devInterceptors: [mockFormationInterceptor] as readonly HttpInterceptorFn[],
};
