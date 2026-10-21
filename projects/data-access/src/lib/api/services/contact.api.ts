import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import { publicRequest } from '../http-context';
import { ApiBody, ApiResponse } from '../operations.generated';

/** Mensajes del formulario de contacto (ruta pública). */
@Injectable({ providedIn: 'root' })
export class ContactApi {
  private readonly api = inject(ApiClient);

  send(body: ApiBody<'Contact_create'>) {
    return this.api.post<ApiResponse<'Contact_create'>>('/api/v1/contact-messages', body, {
      context: publicRequest(),
    });
  }
}
