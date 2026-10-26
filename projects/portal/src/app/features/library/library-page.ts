import { Component, computed, effect, inject, input, linkedSignal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
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

/**
 * Biblioteca digital (HU-09, Figma): recursos publicados con filtro por tipo
 * (`?tipo=`); cada tarjeta abre el recurso con su URL temporal.
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

  /** Filtro de tipo (`?tipo=pdf`); sin él, todos. */
  readonly tipo = input<string>();

  protected readonly filters = RESOURCE_FILTERS;
  protected readonly labels = RESOURCE_TYPE_LABELS;
  protected readonly covers = LIBRARY_COVERS;
  protected readonly active = computed(() => filterBySlug(this.tipo()));

  private readonly limit = linkedSignal({ source: this.active, computation: () => BATCH });
  protected readonly resources = rxResource({
    params: () => {
      const type = this.active()?.type;
      return { ...(type ? { type: [type] } : {}), page: 1, pageSize: this.limit() };
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

  constructor() {
    usePageHeading().set({ title: 'Biblioteca Digital' });
  }

  protected showMore(): void {
    this.limit.update((value) => Math.min(value + BATCH, 100));
  }
}
