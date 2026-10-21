import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import { Uuid } from '../models.generated';
import { ApiQuery, ApiResponse } from '../operations.generated';

/** Biblioteca digital. */
@Injectable({ providedIn: 'root' })
export class LibraryApi {
  private readonly api = inject(ApiClient);

  list(query: ApiQuery<'Library_list'> = {}) {
    return this.api.get<ApiResponse<'Library_list'>>('/api/v1/library', { query: { ...query } });
  }

  access(id: Uuid) {
    return this.api.get<ApiResponse<'Library_access'>>(
      `/api/v1/library/${encodeURIComponent(id)}/access`,
    );
  }
}
