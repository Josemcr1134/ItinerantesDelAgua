import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { authInterceptor, provideAuth, STAFF_ROLES } from 'auth';
import { apiErrorInterceptor, loadingInterceptor, provideApi } from 'data-access';
import { environment } from '../environments/environment';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    // Orden: el loader cuenta la petición completa (incluida la renovación del
    // token) y el error se normaliza al final, ya con el reintento resuelto.
    provideHttpClient(
      withFetch(),
      withInterceptors([loadingInterceptor, authInterceptor, apiErrorInterceptor]),
    ),
    provideApi({ baseUrl: environment.apiBaseUrl }),
    // Mismo login que los participantes; solo entran las cuentas del equipo.
    provideAuth({ platformName: 'Administrador', allowedRoles: STAFF_ROLES }),
  ],
};
