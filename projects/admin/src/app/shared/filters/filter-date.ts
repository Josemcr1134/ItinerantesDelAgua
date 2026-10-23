import { Component, input, model } from '@angular/core';

/** Fecha de una barra de filtros (`AAAA-MM-DD`; vacío = sin filtrar). */
@Component({
  selector: 'adm-filter-date',
  host: { class: 'adm-field' },
  template: `
    <label class="adm-field__label" [for]="inputId()">{{ label() }}</label>
    <input
      class="adm-field__input"
      type="date"
      [id]="inputId()"
      [value]="value()"
      [attr.min]="min() || null"
      [attr.max]="max() || null"
      (change)="value.set($any($event.target).value)"
    />
  `,
})
export class FilterDate {
  readonly value = model.required<string>();
  readonly inputId = input.required<string>();
  readonly label = input.required<string>();
  readonly min = input('');
  readonly max = input('');
}
