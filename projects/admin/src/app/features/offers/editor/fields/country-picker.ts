import { Component, computed, inject, input, model } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CatalogsApi } from 'data-access';
import { catchError, map, of } from 'rxjs';

/** Países elegibles (ISO-2); vacío = todos. Usa el catálogo de países (caché de 24 h). */
@Component({
  selector: 'adm-country-picker',
  template: `
    <fieldset class="picker">
      <legend class="adm-field__label">Países elegibles</legend>
      <p class="adm-field__hint">Sin países, la convocatoria está abierta a todos.</p>
      @if (codes().length) {
        <ul class="chips">
          @for (code of codes(); track code) {
            <li class="chip">
              {{ nameOf(code) }}
              @if (!disabled()) {
                <button
                  type="button"
                  class="chip__remove"
                  (click)="remove(code)"
                  [attr.aria-label]="'Quitar ' + nameOf(code)"
                >
                  ×
                </button>
              }
            </li>
          }
        </ul>
      }
      @if (!disabled()) {
        <label class="visually-hidden" for="country-add">Agregar país</label>
        <select id="country-add" class="adm-field__input" (change)="add($any($event.target))">
          <option value="">Agregar país…</option>
          @for (country of available(); track country.code) {
            <option [value]="country.code">{{ country.name }}</option>
          }
        </select>
      }
    </fieldset>
  `,
  styles: `
    .picker {
      margin: 0;
      padding: 0;
      border: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .chip {
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
    .chip__remove {
      width: 28px;
      height: 28px;
      border: 0;
      border-radius: 50%;
      background: none;
      color: inherit;
      font-size: 1.125rem;
      cursor: pointer;
    }
    .chip__remove:hover {
      background: color-mix(in srgb, var(--color-primary) 15%, transparent);
    }
  `,
})
export class CountryPicker {
  readonly codes = model<readonly string[]>([]);
  readonly disabled = input(false);

  private readonly countries = toSignal(
    inject(CatalogsApi)
      .countries()
      .pipe(
        map((res) => res.data),
        catchError(() => of([])),
      ),
    { initialValue: [] },
  );
  protected readonly available = computed(() => {
    const chosen = new Set(this.codes());
    return this.countries().filter((c) => !chosen.has(c.code));
  });

  protected nameOf(code: string): string {
    return this.countries().find((c) => c.code === code)?.name ?? code;
  }

  protected add(select: HTMLSelectElement): void {
    if (select.value) this.codes.update((list) => [...list, select.value]);
    select.value = '';
  }

  protected remove(code: string): void {
    this.codes.update((list) => list.filter((c) => c !== code));
  }
}
