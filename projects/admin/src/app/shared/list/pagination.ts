import { Component, input, model } from '@angular/core';
import { PaginationMetaDto } from 'data-access';

/** Paginación de una lista: total, página actual, Anterior y Siguiente. */
@Component({
  selector: 'adm-pagination',
  template: `
    @if (meta(); as m) {
      <nav class="adm-pagination" aria-label="Paginación">
        <p class="adm-pagination__info">
          {{ m.total }} {{ m.total === 1 ? noun()[0] : noun()[1] }} · Página {{ m.page }} de
          {{ m.totalPages || 1 }}
        </p>
        <div class="adm-pagination__buttons">
          <button
            type="button"
            class="adm-action"
            [disabled]="m.page <= 1 || loading()"
            (click)="page.set(m.page - 1)"
          >
            Anterior
          </button>
          <button
            type="button"
            class="adm-action"
            [disabled]="m.page >= m.totalPages || loading()"
            (click)="page.set(m.page + 1)"
          >
            Siguiente
          </button>
        </div>
      </nav>
    }
  `,
})
export class Pagination {
  readonly meta = input.required<PaginationMetaDto | null>();
  readonly page = model.required<number>();
  readonly loading = input(false);
  /** Sustantivo en singular y plural: `['oferta', 'ofertas']`. */
  readonly noun = input.required<readonly [string, string]>();
}
