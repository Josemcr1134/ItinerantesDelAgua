import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import { publicRequest } from '../http-context';
import { ContactMessageResponseDto, CreateContactMessageRequestDto } from '../models.generated';

/** Mensajes del formulario de contacto (ruta pública). */
@Injectable({ providedIn: 'root' })
export class ContactApi {
  private readonly api = inject(ApiClient);

  send(body: CreateContactMessageRequestDto) {
    return this.api.post<ContactMessageResponseDto>('/api/v1/contact-messages', body, {
      context: publicRequest(),
    });
  }
}
