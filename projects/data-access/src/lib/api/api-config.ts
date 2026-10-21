import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';

/** URL base de la API (sin barra final), p. ej. `https://api.example.com`. */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

export interface ApiConfig {
  readonly baseUrl: string;
}

/** Registra la configuración de la API en la aplicación. */
export function provideApi(config: ApiConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: API_BASE_URL, useValue: config.baseUrl.replace(/\/+$/, '') },
  ]);
}
