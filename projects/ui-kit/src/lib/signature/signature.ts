import { Component } from '@angular/core';

/** WhatsApp de DJR Solutions (Colombia, +57). */
const DJR_WHATSAPP = 'https://wa.me/573004139456';

/**
 * Firma de quien hizo el sitio ("Hecho por DJR Solutions"), discreta: hereda
 * el color del contenedor con menos opacidad. Lleva al WhatsApp de DJR
 * Solutions en otra pestaña. Va al pie de la landing y del Portal.
 */
@Component({
  selector: 'ui-signature',
  template: `
    <p class="signature">
      Hecho por
      <a
        class="signature__name"
        [href]="whatsapp"
        target="_blank"
        rel="noopener"
        aria-label="DJR Solutions (escribir por WhatsApp)"
        >DJR Solutions</a
      >
    </p>
  `,
  styles: `
    :host {
      display: block;
    }
    .signature {
      margin: 0;
      font-size: 0.75rem;
      letter-spacing: 0.04em;
      opacity: 0.75;
    }
    .signature__name {
      color: inherit;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-decoration: none;
      text-transform: uppercase;

      &:hover {
        text-decoration: underline;
      }

      &:focus-visible {
        border-radius: 2px;
        outline: 2px solid currentColor;
        outline-offset: 2px;
      }
    }
  `,
})
export class Signature {
  protected readonly whatsapp = DJR_WHATSAPP;
}
