import { Component } from '@angular/core';

/**
 * Firma de quien hizo el sitio ("Hecho por DJR Solutions"), discreta: hereda
 * el color del contenedor con menos opacidad. Va al pie de la landing y del
 * Portal.
 */
@Component({
  selector: 'ui-signature',
  template: `<p class="signature">Hecho por <span class="signature__name">DJR Solutions</span></p>`,
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
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
  `,
})
export class Signature {}
