import { Component, input, output } from '@angular/core';
import { Button } from 'ui-kit';
import { ListController } from './list-controller';

/**
 * Estados de una lista paginada alrededor de su contenido: error con
 * reintento, cargando, vacía y vacía por filtros. Si hay elementos, muestra
 * el contenido proyectado (atenuado mientras recarga).
 */
@Component({
  selector: 'adm-list-states',
  imports: [Button],
  template: `
    @let l = list();
    <section class="results" [attr.aria-labelledby]="headingId()" [attr.aria-busy]="l.loading()">
      <h2 class="visually-hidden" [id]="headingId()">{{ heading() }}</h2>
      @if (l.error() && !l.loaded()) {
        <div class="adm-state adm-state--error" role="alert">
          <p>{{ l.error()?.message }}</p>
          <button uiButton variant="secondary" type="button" (click)="l.reload()">
            Reintentar
          </button>
        </div>
      } @else if (!l.loaded()) {
        <p class="adm-state">{{ loadingText() }}</p>
      } @else if (!l.items().length) {
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
