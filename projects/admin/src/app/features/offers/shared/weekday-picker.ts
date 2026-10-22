import { Component, input, model } from '@angular/core';
import { WEEKDAYS } from '../offer-labels';

/** Días de la semana de una regla de horario (días ISO, 1 = lunes … 7 = domingo). */
@Component({
  selector: 'adm-weekday-picker',
  template: `
    <fieldset class="field">
      <legend class="adm-field__label">{{ legend() }}</legend>
      <div class="days">
        @for (day of weekdays; track day.value) {
          <label class="day">
            <input
              class="visually-hidden"
              type="checkbox"
              [checked]="value().includes(day.value)"
              [disabled]="disabled()"
              (change)="toggle(day.value, $any($event.target).checked)"
            />
            <span aria-hidden="true">{{ day.short }}</span>
            <span class="visually-hidden">{{ day.label }}</span>
          </label>
        }
      </div>
      @if (error()) {
        <p class="adm-field__error">{{ error() }}</p>
      }
    </fieldset>
  `,
  styles: `
    .field {
      margin: 0;
      padding: 0;
      border: 0;
    }
    .days {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      margin-top: var(--space-2);
    }
    .day {
      display: inline-grid;
      place-items: center;
      min-width: 52px;
      min-height: 44px;
      padding: 0 var(--space-2);
      border: 1.5px solid #d9d2c1;
      border-radius: 12px;
      background: #fff;
      font-weight: 600;
      cursor: pointer;
    }
    .day:has(input:checked) {
      border-color: var(--color-primary);
      background: var(--color-primary);
      color: var(--color-on-primary);
    }
    .day:has(input:focus-visible) {
      outline: 3px solid var(--color-accent);
      outline-offset: 2px;
    }
    .day:has(input:disabled) {
      cursor: not-allowed;
      opacity: 0.6;
    }
  `,
})
export class WeekdayPicker {
  readonly value = model.required<readonly number[]>();
  readonly legend = input('Días');
  readonly disabled = input(false);
  readonly error = input<string | null>(null);
  protected readonly weekdays = WEEKDAYS;

  protected toggle(day: number, checked: boolean): void {
    this.value.update((list) =>
      checked ? [...list, day].sort((a, b) => a - b) : list.filter((d) => d !== day),
    );
  }
}
