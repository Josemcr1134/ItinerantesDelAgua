import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router';
import { authInterceptor, provideAuth } from 'auth';
import { provideCatalog } from 'catalog';
import { apiErrorInterceptor, cacheInterceptor, loadingInterceptor, provideApi } from 'data-access';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { PortalSeo } from './core/seo/portal-seo';
import { PORTAL_CATALOG } from './features/catalog/portal-catalog';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    // Título y metadatos (descripción, robots, canónica, Open Graph) por ruta.
    { provide: TitleStrategy, useClass: PortalSeo },
    // Mismo orden que el administrador: caché, loader, token y error normalizado.
    provideHttpClient(
      withFetch(),
      withInterceptors([
        cacheInterceptor,
        loadingInterceptor,
        authInterceptor,
        apiErrorInterceptor,
      ]),
    ),
    provideApi({ baseUrl: environment.apiBaseUrl }),
    // Cualquier cuenta activa entra (participantes y, si quieren, el equipo).
    provideAuth({ platformName: 'Portal' }),
    // Catálogo compartido con la landing: aquí las fichas y acciones siguen en el Portal.
    provideCatalog(PORTAL_CATALOG),
  ],
};
