import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { apiErrorInterceptor, provideApi } from 'data-access';
import { environment } from '../environments/environment';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // `anchorScrolling` hace scroll a la sección si la URL trae un ancla al
    // cargar (p. ej. "/#trayectoria" pegado en una pestaña nueva).
    provideRouter(routes, withInMemoryScrolling({ anchorScrolling: 'enabled' })),
    // La landing solo usa rutas públicas: sin sesión ni loader general.
    provideHttpClient(withFetch(), withInterceptors([apiErrorInterceptor])),
    provideApi({ baseUrl: environment.apiBaseUrl }),
  ],
};
