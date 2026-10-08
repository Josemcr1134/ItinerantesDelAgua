import { InjectionToken } from '@angular/core';

/**
 * URL del endpoint que recibe los mensajes del formulario de contacto.
 * `null` mientras el backend no esté listo: el envío falla con
 * `ContactEndpointMissingError` en lugar de llamar a una URL inventada.
 */
export const CONTACT_ENDPOINT = new InjectionToken<string | null>('CONTACT_ENDPOINT', {
  factory: () => null,
});

export class ContactEndpointMissingError extends Error {
  constructor() {
    super('El endpoint de contacto aún no está configurado (CONTACT_ENDPOINT).');
    this.name = 'ContactEndpointMissingError';
  }
}
