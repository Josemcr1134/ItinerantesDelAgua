import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { apiErrorInterceptor, provideApi } from 'data-access';
import { environment } from '../environments/environment';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // La landing solo usa rutas públicas: sin sesión ni loader general.
    provideHttpClient(withFetch(), withInterceptors([apiErrorInterceptor])),
    provideApi({ baseUrl: environment.apiBaseUrl }),
  ],
};
