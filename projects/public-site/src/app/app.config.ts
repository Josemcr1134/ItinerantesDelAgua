import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { apiErrorInterceptor, cacheInterceptor, provideApi } from 'data-access';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { providePageScroll } from './shared/page-scroll/page-scroll';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // El scroll al navegar lo decide providePageScroll: anclas (también al
    // cargar, p. ej. "/#trayectoria" pegado en una pestaña nueva), páginas
    // nuevas y Atrás; `withInMemoryScrolling` solo emite los eventos.
    provideRouter(
      routes,
      withInMemoryScrolling({ anchorScrolling: 'disabled', scrollPositionRestoration: 'disabled' }),
      // Filtros del catálogo (`?tipo=`, `?q=`…) como inputs de la página.
      withComponentInputBinding(),
    ),
    providePageScroll(),
    // La landing solo usa rutas públicas: sin sesión ni loader general. El
    // caché evita repetir llamadas a datos que casi no cambian (cifras).
    provideHttpClient(withFetch(), withInterceptors([cacheInterceptor, apiErrorInterceptor])),
    provideApi({ baseUrl: environment.apiBaseUrl }),
  ],
};
