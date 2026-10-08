import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { CONTACT_ENDPOINT, ContactEndpointMissingError } from './contact-endpoint';
import { ContactMessage } from './contact-message';

/**
 * Envía los mensajes del formulario de contacto.
 * TODO(backend): confirmar el contrato del endpoint (cuerpo y respuesta).
 */
@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = inject(CONTACT_ENDPOINT);

  send(message: ContactMessage): Observable<void> {
    if (!this.endpoint) {
      return throwError(() => new ContactEndpointMissingError());
    }
    return this.http.post<void>(this.endpoint, message);
  }
}
