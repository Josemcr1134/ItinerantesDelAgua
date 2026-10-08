import { Component, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'inverse';

/**
 * Estilo de botón aplicable a `<button>` y `<a>`, conservando la semántica
 * nativa de cada elemento.
 *
 * <a uiButton href="#contacto">Hablemos</a>
 * <button uiButton variant="secondary" type="button">...</button>
 */
@Component({
  selector: 'a[uiButton], button[uiButton]',
  template: '<ng-content />',
  styleUrl: './button.scss',
  host: {
    class: 'ui-button',
    '[class.ui-button--secondary]': 'variant() === "secondary"',
    '[class.ui-button--inverse]': 'variant() === "inverse"',
  },
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
}
