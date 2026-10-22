import { Component, computed, contentChildren, input, output, signal } from '@angular/core';
import { FilterSelect } from './filter-select';

let nextBarId = 0;

/** Filtros que caben junto a la búsqueda en una sola fila (desde xl). */
const MAX_FILTERS_IN_ROW = 5;

/**
 * Barra de filtros de una lista. La búsqueda (`[admFilterSearch]`) siempre
 * está a la vista; el resto de filtros se pliega en pantallas pequeñas (hasta
 * xl) tras el botón "Filtros", que muestra cuántos hay aplicados. Desde xl
 * todo se ve en una fila (con más de cinco filtros, la búsqueda arriba y los
 * filtros en rejilla debajo).
 *
 * ```html
 * <adm-filter-bar label="Filtrar ofertas" [activeCount]="list.activeFilterCount()" (clear)="clearFilters()">
 *   <adm-search-field admFilterSearch … />
 *   <adm-filter-select … />
 * </adm-filter-bar>
 * ```
 */
@Component({
  selector: 'adm-filter-bar',
  template: `
    <form
      class="bar"
      [class.bar--stacked]="stacked()"
      role="search"
      [attr.aria-label]="label()"
      (submit)="$event.preventDefault()"
    >
      <div class="bar__top">
        <div class="bar__search"><ng-content select="[admFilterSearch]" /></div>
        @if (hasFilters()) {
          <button
            type="button"
            class="adm-action bar__toggle"
            [attr.aria-expanded]="open()"
            [attr.aria-controls]="id"
            (click)="open.set(!open())"
          >
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            Filtros
            @if (activeCount()) {
              <span class="bar__count"
                >{{ activeCount() }}<span class="visually-hidden"> aplicados</span></span
              >
            }
          </button>
        }
      </div>
      @if (hasFilters()) {
        <div class="bar__filters" [class.bar__filters--open]="open()" [id]="id">
          <ng-content />
          @if (activeCount()) {
            <button type="button" class="adm-link bar__clear" (click)="clear.emit()">
              Limpiar filtros
            </button>
          }
        </div>
      }
    </form>
  `,
  styleUrl: './filter-bar.scss',
})
export class FilterBar {
  /** Nombre accesible del formulario de búsqueda. */
  readonly label = input.required<string>();
  /** Filtros aplicados (se muestran en el botón y habilitan "Limpiar"). */
  readonly activeCount = input(0);
  readonly clear = output<void>();

  protected readonly id = `adm-filters-${nextBarId++}`;
  protected readonly open = signal(false);
  private readonly selects = contentChildren(FilterSelect, { descendants: true });
  /** Hay filtros además de la búsqueda (si no, no hace falta plegar nada). */
  protected readonly hasFilters = computed(() => this.selects().length > 0);
  /** Con muchos filtros, desde xl la búsqueda va en su fila y los filtros debajo. */
  protected readonly stacked = computed(() => this.selects().length > MAX_FILTERS_IN_ROW);
}
