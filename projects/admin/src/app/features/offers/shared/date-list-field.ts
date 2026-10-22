import { Component, input, model, signal } from '@angular/core';

let nextId = 0;

/** Lista de fechas (AAAA-MM-DD) ordenada: agregar y quitar (p. ej. recesos). */
@Component({
  selector: 'adm-date-list-field',
  template: `
    <span class="adm-field__label" [id]="id + '-label'">{{ label() }}</span>
    @if (value().length) {
      <ul class="dates" [attr.aria-labelledby]="id + '-label'">
        @for (date of value(); track date) {
          <li class="date">
            {{ date }}
            @if (!disabled()) {
              <button type="button" (click)="remove(date)" [attr.aria-label]="'Quitar ' + date">
                ×
              </button>
            }
          </li>
        }
      </ul>
    }
    @if (!disabled()) {
      <div class="add">
        <label class="visually-hidden" [for]="id">{{ addLabel() }}</label>
        <input
          class="adm-field__input"
          type="date"
          [id]="id"
          [value]="draft()"
          (input)="draft.set($any($event.target).value)"
        />
        <button type="button" class="adm-action" (click)="add()">Agregar fecha</button>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }
    .dates {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      margin: var(--space-2) 0 0;
      padding: 0;
      list-style: none;
    }
    .date {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 6px 4px 12px;
      border-radius: var(--radius-pill);
      background: color-mix(in srgb, var(--color-primary) 12%, transparent);
      color: var(--color-primary);
      font-weight: 600;
      font-size: 0.875rem;
    }
    .date button {
      width: 28px;
      height: 28px;
      border: 0;
      border-radius: 50%;
      background: none;
      color: inherit;
      font-size: 1.125rem;
      cursor: pointer;
    }
    .add {
      display: flex;
      gap: var(--space-2);
      margin-top: var(--space-2);
    }
  `,
})
export class DateListField {
  readonly value = model.required<readonly string[]>();
  readonly label = input.required<string>();
  /** Nombre accesible del campo para agregar una fecha. */
  readonly addLabel = input('Nueva fecha');
  readonly disabled = input(false);

  protected readonly id = `adm-date-list-${nextId++}`;
  protected readonly draft = signal('');

  protected add(): void {
    const date = this.draft();
    if (date && !this.value().includes(date)) {
      this.value.update((list) => [...list, date].sort());
    }
    this.draft.set('');
  }

  protected remove(date: string): void {
    this.value.update((list) => list.filter((d) => d !== date));
  }
}
