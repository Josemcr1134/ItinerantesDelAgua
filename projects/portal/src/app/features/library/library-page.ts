import { Component, computed, DestroyRef, inject, input, linkedSignal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LibraryApi, toApiError } from 'data-access';
import { usePageHeading } from '../../core/page-heading/page-heading';
import {
  filterBySlug,
  LIBRARY_COVERS,
  RESOURCE_FILTERS,
  RESOURCE_TYPE_LABELS,
} from './library-options';
import { resourceOpener } from './open-resource';
import { ResourceCard } from './resource-card/resource-card';
import { ResourceIcon } from './resource-icon';

/** Recursos por tanda ("Ver más" pide la siguiente). */
const BATCH = 18;
/** Espera tras la última tecla antes de buscar. */
const SEARCH_DELAY = 350;

/**
 * Biblioteca digital (HU-09, Figma): recursos publicados con filtro por tipo
 * (`?tipo=`) y buscador (`?q=`, título, autor o palabra clave); cada tarjeta
 * abre el recurso con su URL temporal.
 */
@Component({
  selector: 'portal-library-page',
  imports: [RouterLink, ResourceCard, ResourceIcon],
  templateUrl: './library-page.html',
  styleUrl: './library-page.scss',
})
export default class LibraryPage {
  private readonly api = inject(LibraryApi);
  protected readonly open = resourceOpener();

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Filtro de tipo (`?tipo=pdf`); sin él, todos. */
  readonly tipo = input<string>();
  /** Búsqueda (`?q=`). */
  readonly q = input<string>();
  /** Lo que se escribe; la URL (y la búsqueda) se actualiza al dejar de escribir. */
  protected readonly term = linkedSignal(() => this.q() ?? '');
  protected readonly query = computed(() => (this.q() ?? '').trim());
  private searchTimer: ReturnType<typeof setTimeout> | undefined;

  protected readonly filters = RESOURCE_FILTERS;
  protected readonly labels = RESOURCE_TYPE_LABELS;
  protected readonly covers = LIBRARY_COVERS;
  protected readonly active = computed(() => filterBySlug(this.tipo()));

  private readonly limit = linkedSignal({
    source: () => [this.active(), this.query()] as const,
    computation: () => BATCH,
  });
  protected readonly resources = rxResource({
    params: () => {
      const type = this.active()?.type;
      const q = this.query();
      return {
        ...(type ? { type: [type] } : {}),
        ...(q ? { q } : {}),
        page: 1,
        pageSize: this.limit(),
      };
    },
    stream: ({ params }) => this.api.list(params),
  });
  protected readonly items = computed(() => this.resources.value()?.data ?? []);
  protected readonly hasMore = computed(() => {
    const meta = this.resources.value()?.meta;
    return !!meta && meta.total > this.items().length && this.limit() < 100;
  });
  protected readonly loadError = computed(() => {
    const error = this.resources.error();
    return error ? toApiError(error).message : null;
  });

  /** Hay algún filtro o búsqueda que se pueda limpiar. */
  protected readonly filtered = computed(() => !!this.active() || !!this.query());

  constructor() {
    usePageHeading().set({ title: 'Biblioteca Digital' });
    inject(DestroyRef).onDestroy(() => clearTimeout(this.searchTimer));
  }

  protected onSearch(value: string): void {
    this.term.set(value);
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.applySearch(), SEARCH_DELAY);
  }

  /** Enter: busca de inmediato. */
  protected applySearch(): void {
    clearTimeout(this.searchTimer);
    const q = this.term().trim() || null;
    if (q === (this.q()?.trim() || null)) return;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected clearSearch(): void {
    this.term.set('');
    this.applySearch();
  }

  protected showMore(): void {
    this.limit.update((value) => Math.min(value + BATCH, 100));
  }
}
