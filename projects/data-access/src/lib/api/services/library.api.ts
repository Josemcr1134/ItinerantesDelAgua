import { inject, Injectable } from '@angular/core';
import { ApiClient, PageQuery, Paginated } from '../api-client';
import { AccessUrlDto, LibraryItemDto } from '../models.generated';

export interface LibraryQuery extends PageQuery {
  readonly type?: readonly LibraryItemDto['type'][];
  readonly q?: string;
}

/** Biblioteca digital. */
@Injectable({ providedIn: 'root' })
export class LibraryApi {
  private readonly api = inject(ApiClient);

  list(query: LibraryQuery = {}) {
    return this.api.get<Paginated<LibraryItemDto>>('/api/v1/library', { query: { ...query } });
  }

  access(id: string) {
    return this.api.get<AccessUrlDto>(`/api/v1/library/${encodeURIComponent(id)}/access`);
  }
}
