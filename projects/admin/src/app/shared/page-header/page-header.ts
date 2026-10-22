import { Component, input } from '@angular/core';

/**
 * Cabecera de una pantalla del panel: título (Amatic SC), descripción y
 * acciones a la derecha (proyectadas).
 *
 * ```html
 * <adm-page-header title="Docentes" lead="…">
 *   <button uiButton>Registrar docente</button>
 * </adm-page-header>
 * ```
 */
@Component({
  selector: 'adm-page-header',
  template: `
    <header class="header">
      <div class="header__text">
        <h1 class="header__title">{{ title() }}</h1>
        @if (lead()) {
          <p class="header__lead">{{ lead() }}</p>
        }
      </div>
      <div class="header__actions">
        <ng-content />
      </div>
    </header>
  `,
  styles: `
    .header {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      justify-content: space-between;
      gap: var(--space-3);
    }
    .header__text {
      min-width: 0;
    }
    .header__title {
      color: var(--color-primary);
      font-family: var(--font-family-display);
      font-size: 3rem;
      text-transform: uppercase;
      overflow-wrap: anywhere;
    }
    .header__lead {
      margin-top: var(--space-1);
      color: var(--color-primary);
    }
    .header__actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }
    .header__actions:empty {
      display: none;
    }
  `,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly lead = input<string>();
}
