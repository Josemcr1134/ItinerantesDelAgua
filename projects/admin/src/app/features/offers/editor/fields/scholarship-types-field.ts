import { Component, computed, input, model } from '@angular/core';
import { AdminOfferScholarshipTypeDto, AdminScholarshipTypeDto } from 'data-access';
import { percentRange } from '../../../scholarship-types/scholarship-type-labels';

/** Tipo de beca habilitado en la oferta, con sus ajustes solo para ella (`null` = el del tipo). */
export interface OfferScholarshipChoice {
  readonly scholarshipTypeId: string;
  readonly minPercent: number | null;
  readonly maxPercent: number | null;
  readonly maxRecipients: number | null;
}

type Override = 'minPercent' | 'maxPercent' | 'maxRecipients';

/**
 * Tipos de beca de una oferta (paso 4): se habilitan del catálogo y, solo
 * para esta oferta, se puede ajustar el rango de % y poner un tope de becas.
 * Muestra el cupo global del tipo y el usado en la oferta.
 */
@Component({
  selector: 'adm-scholarship-types-field',
  template: `
    <fieldset class="field" [attr.aria-describedby]="error() ? 'sch-types-error' : null">
      <legend class="adm-field__label">Tipos de beca</legend>
      <p class="adm-field__hint">
        El rango y el cupo vienen del tipo; aquí puedes ajustarlos solo para esta oferta (vacío = el
        del tipo).
      </p>
      @if (!rows().length) {
        <p class="adm-callout adm-callout--info">
          Aún no hay tipos de beca activos (se crean en «Becas»).
        </p>
      }
      <ul class="types">
        @for (row of rows(); track row.type.id) {
          @let choice = choiceOf(row.type.id);
          <li class="type" [class.type--on]="!!choice" [class.type--inactive]="!row.type.active">
            <label class="adm-check type__check">
              <input
                type="checkbox"
                [checked]="!!choice"
                [disabled]="disabled() || (!row.type.active && !choice)"
                (change)="toggle(row.type.id, $any($event.target).checked)"
              />
              <span class="type__text">
                <span class="type__name">{{ row.type.name }}</span>
                <span class="type__meta">
                  {{ range(row.type.minPercent, row.type.maxPercent) }}
                  @if (row.type.requiresInterview) {
                    · requiere entrevista
                  }
                  @if (!row.type.active) {
                    · <strong>desactivado</strong>
                  } @else if (row.type.isFull) {
                    · <strong class="full">agotado</strong>
                  } @else if (row.type.availableRecipients !== null) {
                    · {{ row.type.availableRecipients }} de {{ row.type.maxRecipients }} disponibles
                  }
                </span>
              </span>
            </label>

            @if (choice) {
              <div class="overrides">
                <div class="adm-field">
                  <label class="adm-field__label" [for]="'sch-min-' + row.type.id">% mín.</label>
                  <input
                    class="adm-field__input"
                    type="number"
                    inputmode="numeric"
                    min="1"
                    max="100"
                    [id]="'sch-min-' + row.type.id"
                    [placeholder]="row.type.minPercent"
                    [value]="choice.minPercent ?? ''"
                    [disabled]="disabled()"
                    (input)="set(row.type.id, 'minPercent', $any($event.target).value)"
                  />
                </div>
                <div class="adm-field">
                  <label class="adm-field__label" [for]="'sch-max-' + row.type.id">% máx.</label>
                  <input
                    class="adm-field__input"
                    type="number"
                    inputmode="numeric"
                    min="1"
                    max="100"
                    [id]="'sch-max-' + row.type.id"
                    [placeholder]="row.type.maxPercent"
                    [value]="choice.maxPercent ?? ''"
                    [disabled]="disabled()"
                    (input)="set(row.type.id, 'maxPercent', $any($event.target).value)"
                  />
                </div>
                <div class="adm-field">
                  <label class="adm-field__label" [for]="'sch-cap-' + row.type.id"
                    >Tope en la oferta</label
                  >
                  <input
                    class="adm-field__input"
                    type="number"
                    inputmode="numeric"
                    min="1"
                    placeholder="Sin tope"
                    [id]="'sch-cap-' + row.type.id"
                    [value]="choice.maxRecipients ?? ''"
                    [disabled]="disabled()"
                    (input)="set(row.type.id, 'maxRecipients', $any($event.target).value)"
                  />
                </div>
              </div>
              @if (row.quota; as q) {
                <p class="quota" [class.full]="q.isFull">
                  En esta oferta: {{ q.offerUsedRecipients }}
                  {{ q.offerUsedRecipients === 1 ? 'asignada' : 'asignadas' }}
                  @if (q.isFull) {
                    · sin cupo (no se puede aprobar más)
                  } @else if (q.availableRecipients !== null) {
                    · {{ q.availableRecipients }} disponibles
                  }
                </p>
              }
              @if (rangeError(choice, row.type); as message) {
                <p class="adm-field__error">{{ message }}</p>
              }
            }
          </li>
        }
      </ul>
      @if (error()) {
        <p id="sch-types-error" class="adm-field__error">{{ error() }}</p>
      }
    </fieldset>
  `,
  styles: `
    .field {
      margin: 0;
      padding: 0;
      border: 0;
    }
    .types {
      display: grid;
      gap: var(--space-2);
      margin: var(--space-3) 0 0;
      padding: 0;
      list-style: none;
    }
    .type {
      padding: var(--space-3);
      border: 1.5px solid color-mix(in srgb, var(--color-primary) 18%, transparent);
      border-radius: 14px;
    }
    .type--on {
      border-color: var(--color-primary);
      background-color: color-mix(in srgb, var(--color-primary) 5%, transparent);
    }
    .type--inactive {
      opacity: 0.75;
    }
    .type__text {
      display: grid;
    }
    .type__name {
      font-weight: 700;
    }
    .type__meta {
      color: color-mix(in srgb, var(--color-raisin-black) 65%, transparent);
      font-size: 0.8125rem;
    }
    .overrides {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 8rem), 1fr));
      gap: var(--space-2) var(--space-3);
      margin-top: var(--space-3);
    }
    .quota {
      margin: var(--space-2) 0 0;
      color: color-mix(in srgb, var(--color-raisin-black) 70%, transparent);
      font-size: 0.8125rem;
    }
    .full {
      color: var(--color-danger);
    }
  `,
})
export class ScholarshipTypesField {
  readonly value = model.required<readonly OfferScholarshipChoice[]>();
  /** Catálogo (incluye inactivos). */
  readonly catalog = input.required<readonly AdminScholarshipTypeDto[]>();
  /** Tipos que la oferta ya tenía guardados (con su cupo en la oferta). */
  readonly saved = input<readonly AdminOfferScholarshipTypeDto[]>([]);
  readonly disabled = input(false);
  readonly error = input<string | null>(null);

  /** Activos del catálogo y, además, los inactivos que la oferta ya tenía. */
  protected readonly rows = computed(() => {
    const quotas = new Map(this.saved().map((s) => [s.scholarshipTypeId, s.quota]));
    const chosen = new Set(this.value().map((c) => c.scholarshipTypeId));
    return this.catalog()
      .filter((type) => type.active || chosen.has(type.id) || quotas.has(type.id))
      .map((type) => ({ type, quota: quotas.get(type.id) ?? null }));
  });

  protected readonly range = percentRange;

  protected choiceOf(id: string): OfferScholarshipChoice | undefined {
    return this.value().find((c) => c.scholarshipTypeId === id);
  }

  protected toggle(id: string, checked: boolean): void {
    this.value.update((list) =>
      checked
        ? [
            ...list,
            { scholarshipTypeId: id, minPercent: null, maxPercent: null, maxRecipients: null },
          ]
        : list.filter((c) => c.scholarshipTypeId !== id),
    );
  }

  protected set(id: string, field: Override, raw: string): void {
    const number = raw === '' ? null : Math.trunc(Number(raw));
    this.value.update((list) =>
      list.map((c) =>
        c.scholarshipTypeId === id ? { ...c, [field]: Number.isFinite(number) ? number : null } : c,
      ),
    );
  }

  /** Rango efectivo inválido (el ajuste de la oferta junto al del tipo). */
  protected rangeError(
    choice: OfferScholarshipChoice,
    type: AdminScholarshipTypeDto,
  ): string | null {
    const min = choice.minPercent ?? type.minPercent;
    const max = choice.maxPercent ?? type.maxPercent;
    if (min < 1 || max > 100) return 'El porcentaje va de 1 a 100.';
    if (min > max) return 'El % mínimo no puede ser mayor que el máximo.';
    if (choice.maxRecipients !== null && choice.maxRecipients < 1)
      return 'El tope debe ser 1 o más.';
    return null;
  }
}
