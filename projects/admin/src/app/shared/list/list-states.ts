import { Component, input, output } from '@angular/core';
import { RequestState } from '../request-state/request-state';
import { ListController } from './list-controller';

/**
 * Estados de una lista paginada alrededor de su contenido: los de la carga
 * (`adm-request-state`) más "vacía" y "vacía por filtros". Si hay elementos,
 * muestra el contenido proyectado (atenuado mientras recarga).
 */
@Component({
  selector: 'adm-list-states',
  imports: [RequestState],
  template: `
    @let l = list();
    <section class="results" [attr.aria-labelledby]="headingId()" [attr.aria-busy]="l.loading()">
      <h2 class="visually-hidden" [id]="headingId()">{{ heading() }}</h2>
      <adm-request-state
        [error]="l.error()"
        [loaded]="l.loaded()"
        [loadingText]="loadingText()"
        (retry)="l.reload()"
      >
        @if (!l.items().length) {
          <div class="adm-state">
            @if (l.hasFilters()) {
              <p>{{ filteredText() }}</p>
              <button type="button" class="adm-link" (click)="clearFilters.emit()">
                Quitar filtros
              </button>
            } @else {
              <p>{{ emptyText() }}</p>
            }
          </div>
        } @else {
          <div class="results__content" [class.results__content--loading]="l.loading()">
            <ng-content />
          </div>
        }
      </adm-request-state>
    </section>
  `,
  styles: `
    .results {
      margin-top: var(--space-4);
    }
    .results__content--loading {
      opacity: 0.6;
      transition: opacity 0.2s;
    }
  `,
})
export class ListStates {
  readonly list = input.required<ListController<unknown>>();
  /** Título oculto de la sección (para lectores de pantalla). */
  readonly heading = input.required<string>();
  readonly headingId = input.required<string>();
  readonly loadingText = input('Cargando…');
  readonly emptyText = input.required<string>();
  readonly filteredText = input('No hay resultados con esos filtros.');
  /** "Quitar filtros": la pantalla limpia sus filtros y la búsqueda. */
  readonly clearFilters = output<void>();
}
