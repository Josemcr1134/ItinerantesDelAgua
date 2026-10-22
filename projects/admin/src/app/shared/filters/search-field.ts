import { Component, input, model } from '@angular/core';

/** Campo de búsqueda de una barra de filtros (`adm-filter-bar`). */
@Component({
  selector: 'adm-search-field',
  host: { class: 'adm-field' },
  template: `
    <label class="adm-field__label" [for]="inputId()">{{ label() }}</label>
    <input
      class="adm-field__input"
      type="search"
      autocomplete="off"
      [id]="inputId()"
      [placeholder]="placeholder()"
      [value]="value()"
      (input)="value.set($any($event.target).value)"
    />
  `,
})
export class SearchField {
  readonly value = model('');
  readonly inputId = input.required<string>();
  readonly label = input('Buscar');
  readonly placeholder = input('');
}
