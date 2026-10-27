import { Component, computed, input, model } from '@angular/core';

/** Lo que necesita la paginación de una respuesta paginada (`meta` de la API). */
export interface PaginationMeta {
  readonly page: number;
  readonly total: number;
  readonly totalPages: number;
}

/** Hueco entre números de página ("…"). */
const GAP = 'gap';

/**
 * Paginación de una lista: total, página actual y [Anterior] / [Siguiente].
 * Con `numbered`, además los números de página (la primera, la última y las
 * vecinas de la actual, con "…" en los huecos).
 *
 * <ui-pagination [meta]="list.meta()" [(page)]="page" [noun]="['oferta', 'ofertas']" />
 */
@Component({
  selector: 'ui-pagination',
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
  host: { '[class.ui-pagination--numbered]': 'numbered()' },
})
export class Pagination {
  readonly meta = input.required<PaginationMeta | null>();
  readonly page = model.required<number>();
  readonly loading = input(false);
  /** Sustantivo en singular y plural: `['oferta', 'ofertas']`. */
  readonly noun = input.required<readonly [string, string]>();
  /** Muestra los números de página. */
  readonly numbered = input(false);
  readonly label = input('Paginación');

  protected readonly gap = GAP;
  protected readonly pages = computed<readonly (number | typeof GAP)[]>(() => {
    const m = this.meta();
    if (!m || m.totalPages <= 1) return [1];
    const last = m.totalPages;
    const wanted = new Set([1, last, m.page - 1, m.page, m.page + 1]);
    const pages = [...wanted].filter((p) => p >= 1 && p <= last).sort((a, b) => a - b);
    return pages.flatMap((p, i) => {
      const previous = pages[i - 1];
      if (previous === undefined || p - previous === 1) return [p];
      // Un solo número saltado se muestra en lugar de "…".
      return p - previous === 2 ? [p - 1, p] : [GAP, p];
    });
  });

  protected go(page: number): void {
    if (page !== this.page()) this.page.set(page);
  }
}
