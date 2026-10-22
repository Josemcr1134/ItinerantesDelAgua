import { Component, input, model } from '@angular/core';

export interface FilterOption<T extends string> {
  readonly value: T;
  readonly label: string;
}

/** Opciones a partir de los valores de un enum y sus textos. */
export const optionsFrom = <T extends string>(
  values: readonly T[],
  labels: Readonly<Record<T, string>>,
): FilterOption<T>[] => values.map((value) => ({ value, label: labels[value] }));

/**
 * Selector de una barra de filtros. Con `allLabel` agrega la opción "todos"
 * (valor `''`); sin ella, siempre hay un valor elegido (p. ej. el orden).
 * Conserva el tipo del enum: `[(value)]` acepta `WritableSignal<Role | ''>`.
 */
@Component({
  selector: 'adm-filter-select',
  host: { class: 'adm-field' },
  template: `
    <label class="adm-field__label" [for]="inputId()">{{ label() }}</label>
    <select class="adm-field__input" [id]="inputId()" (change)="pick($any($event.target).value)">
      @if (allLabel(); as all) {
        <option value="" [selected]="value() === ''">{{ all }}</option>
      }
      @for (option of options(); track option.value) {
        <option [value]="option.value" [selected]="option.value === value()">
          {{ option.label }}
        </option>
      }
    </select>
  `,
})
export class FilterSelect<T extends string> {
  readonly value = model.required<T | ''>();
  readonly options = input.required<readonly FilterOption<T>[]>();
  readonly inputId = input.required<string>();
  readonly label = input.required<string>();
  /** Texto de la opción "todos" (sin él, no se ofrece). */
  readonly allLabel = input<string>();

  protected pick(value: string): void {
    this.value.set(value as T | '');
  }
}
