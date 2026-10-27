import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import { ApiBody, ApiResponse } from '../operations.generated';

/**
 * Acceso de quien estudia en Moodle (HU-25): vincula sus formaciones a la
 * cuenta por su correo (en la lista de inscritos) o con un código de acceso.
 * `linked` trae solo las vinculadas ahora; las de antes ya están en Mi formación.
 */
@Injectable({ providedIn: 'root' })
export class MoodleAccessApi {
  private readonly api = inject(ApiClient);

  /** Busca mi correo en las listas de inscritos. `found = false`: no está. Idempotente. */
  link() {
    return this.api.post<ApiResponse<'Moodle_link'>>('/api/v1/me/moodle-access/link');
  }

  /**
   * Código `XXXX-XXXX` de un solo uso. Errores: `MOODLE_CODE_INVALID`,
   * `MOODLE_CODE_USED`, `MOODLE_CODE_EXPIRED`, `ENROLLMENT_ALREADY_EXISTS`.
   */
  redeem(body: ApiBody<'Moodle_redeem'>) {
    return this.api.post<ApiResponse<'Moodle_redeem'>>('/api/v1/me/moodle-access/redeem', body);
  }
}
