import { Component, input } from '@angular/core';
import { Button } from 'ui-kit';
import { SECTION_IDS } from '../../content/section-ids';
import { ClosingCtaContent } from './closing-cta-content';

/** Sección de cierre sobre fondo oscuro; destino del ancla "Contacto". */
@Component({
  selector: 'pub-closing-cta',
  imports: [Button],
  templateUrl: './closing-cta.html',
  styleUrl: './closing-cta.scss',
})
export class ClosingCta {
  readonly content = input.required<ClosingCtaContent>();

  protected readonly sectionId = SECTION_IDS.contact;
}
