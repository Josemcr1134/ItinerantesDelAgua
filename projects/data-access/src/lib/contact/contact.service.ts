import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { CONTACT_ENDPOINT, ContactEndpointMissingError } from './contact-endpoint';

/**
 * Envía los mensajes del formulario de contacto.
 * TODO(backend): tipar el cuerpo cuando se definan los campos del formulario
 * y el contrato del endpoint.
 */
@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = inject(CONTACT_ENDPOINT);

  send(message: Readonly<Record<string, string>>): Observable<void> {
    if (!this.endpoint) {
      return throwError(() => new ContactEndpointMissingError());
    }
    return this.http.post<void>(this.endpoint, message);
  }
}
