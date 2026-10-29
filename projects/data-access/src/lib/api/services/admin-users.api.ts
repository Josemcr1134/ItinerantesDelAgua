import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import { cachedRequest, hours } from '../cache/cache-options';
import { Uuid } from '../models.generated';
import { ApiBody, ApiQuery, ApiResponse } from '../operations.generated';

/** Acceso al panel y gestión del equipo (roles y estado de las cuentas). */
@Injectable({ providedIn: 'root' })
export class AdminUsersApi {
  private readonly api = inject(ApiClient);

  /** Mis roles y permisos efectivos en el panel (403 si no soy del equipo). */
  me() {
    return this.api.get<ApiResponse<'AdminUsers_me'>>('/api/v1/admin/me');
  }

  /** Catálogo rol → permisos con su nombre visible (igual para todos: caché de 1 h). */
  roles() {
    return this.api.get<ApiResponse<'AdminUsers_roles'>>('/api/v1/admin/roles', {
      context: cachedRequest({ ttl: hours(1), persist: false }),
    });
  }

  /** Cuentas: el equipo (`staffOnly`) o cualquier persona registrada. */
  list(query: ApiQuery<'AdminUsers_list'> = {}) {
    return this.api.get<ApiResponse<'AdminUsers_list'>>('/api/v1/admin/users', {
      query: { ...query },
    });
  }

  /** Reemplaza los roles del equipo (`PARTICIPANT` se conserva siempre). */
  updateRoles(id: Uuid, body: ApiBody<'AdminUsers_updateRoles'>) {
    return this.api.put<ApiResponse<'AdminUsers_updateRoles'>>(
      `/api/v1/admin/users/${encodeURIComponent(id)}/roles`,
      body,
    );
  }

  disable(id: Uuid, body: ApiBody<'AdminUsers_disable'> = {}) {
    return this.api.post<ApiResponse<'AdminUsers_disable'>>(
      `/api/v1/admin/users/${encodeURIComponent(id)}/disable`,
      body,
    );
  }

  enable(id: Uuid, body: ApiBody<'AdminUsers_enable'> = {}) {
    return this.api.post<ApiResponse<'AdminUsers_enable'>>(
      `/api/v1/admin/users/${encodeURIComponent(id)}/enable`,
      body,
    );
  }

  /**
   * Marca el correo como verificado (soporte, cuando no llega el código):
   * `PENDING_VERIFICATION` pasa a `ACTIVE`. Ya verificado → 409 `AUTH_ALREADY_VERIFIED`.
   */
  verifyEmail(id: Uuid, body: ApiBody<'AdminUsers_verifyEmail'> = {}) {
    return this.api.post<ApiResponse<'AdminUsers_verifyEmail'>>(
      `/api/v1/admin/users/${encodeURIComponent(id)}/verify-email`,
      body,
    );
  }
}
