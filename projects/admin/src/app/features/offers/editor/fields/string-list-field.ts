import { Component, input, model, signal } from '@angular/core';
import { moveItem, removeAt } from '../../../../shared/list/reorder';

let nextListId = 0;

/** Lista de textos cortos ("¿Qué aprenderás?"): agregar, editar, mover y quitar. */
@Component({
  selector: 'adm-string-list-field',
  template: `
    <fieldset class="list" [attr.aria-describedby]="issue() ? id + '-issue' : null">
      <legend class="adm-field__label">{{ label() }}</legend>
      <ol class="items">
        @for (item of items(); track $index; let i = $index, first = $first, last = $last) {
          <li class="item">
            <label class="visually-hidden" [for]="id + '-' + i">{{ label() }} {{ i + 1 }}</label>
            <input
              class="adm-field__input item__input"
              [id]="id + '-' + i"
              [value]="item"
              [disabled]="disabled()"
              (input)="edit(i, $any($event.target).value)"
            />
            @if (!disabled()) {
              <button
                type="button"
                class="adm-action"
                [disabled]="first"
                (click)="move(i, -1)"
                [attr.aria-label]="'Subir punto ' + (i + 1)"
              >
                ↑
              </button>
              <button
                type="button"
                class="adm-action"
                [disabled]="last"
                (click)="move(i, 1)"
                [attr.aria-label]="'Bajar punto ' + (i + 1)"
              >
                ↓
              </button>
              <button
                type="button"
                class="adm-action adm-action--danger"
                (click)="remove(i)"
                [attr.aria-label]="'Quitar punto ' + (i + 1)"
              >
                Quitar
              </button>
            }
          </li>
        }
      </ol>
      @if (!disabled()) {
        <div class="add">
          <label class="visually-hidden" [for]="id + '-new'">Nuevo punto</label>
          <input
            class="adm-field__input"
            [id]="id + '-new'"
            [placeholder]="placeholder()"
            [value]="draft()"
            (input)="draft.set($any($event.target).value)"
            (keydown.enter)="$event.preventDefault(); add()"
          />
          <button type="button" class="adm-action" (click)="add()">Agregar</button>
        </div>
      }
      @if (issue()) {
        <p class="adm-field__error" [id]="id + '-issue'">{{ issue() }}</p>
      }
    </fieldset>
  `,
  styles: `
    .list {
      margin: 0;
      padding: 0;
      border: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    .items {
      display: grid;
      gap: var(--space-2);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .item,
    .add {
      display: flex;
      gap: var(--space-2);
      align-items: center;
    }
    .item__input,
    .add input {
      flex: 1;
      min-width: 0;
    }
  `,
})
export class StringListField {
  readonly items = model<readonly string[]>([]);
  readonly label = input.required<string>();
  readonly placeholder = input('Escribe y pulsa Agregar');
  readonly disabled = input(false);
  readonly issue = input<string | null>(null);

  protected readonly id = `adm-list-${nextListId++}`;
  protected readonly draft = signal('');

  protected add(): void {
    const text = this.draft().trim();
    if (!text) return;
    this.items.update((list) => [...list, text]);
    this.draft.set('');
  }

  protected edit(index: number, value: string): void {
    this.items.update((list) => list.map((item, i) => (i === index ? value : item)));
  }

  protected move(index: number, delta: number): void {
    this.items.update((list) => moveItem(list, index, delta));
  }

  protected remove(index: number): void {
    this.items.update((list) => removeAt(list, index));
  }
}
