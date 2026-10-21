import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import { AUTH_CONFIG, AuthConfig, DEFAULT_AUTH_CONFIG } from './auth.config';
import { AuthService } from './auth.service';

/**
 * Configura la autenticación de una app: rutas, roles con acceso y la
 * redirección al login cuando la sesión expira.
 */
export function provideAuth(config: Partial<AuthConfig> = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: AUTH_CONFIG, useValue: { ...DEFAULT_AUTH_CONFIG, ...config } },
    provideEnvironmentInitializer(() => inject(AuthService)),
  ]);
}
