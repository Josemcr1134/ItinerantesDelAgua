import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // `anchorScrolling` hace scroll a la sección si la URL trae un ancla al
    // cargar (p. ej. "/#trayectoria" pegado en una pestaña nueva).
    provideRouter(routes, withInMemoryScrolling({ anchorScrolling: 'enabled' })),
    provideHttpClient(withFetch()),
    // TODO(backend): proveer CONTACT_ENDPOINT (data-access) cuando exista.
  ],
};
