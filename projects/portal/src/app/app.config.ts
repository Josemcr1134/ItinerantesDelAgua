import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { authInterceptor, provideAuth } from 'auth';
import { apiErrorInterceptor, cacheInterceptor, loadingInterceptor, provideApi } from 'data-access';
import { environment } from '../environments/environment';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
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
  ],
};
