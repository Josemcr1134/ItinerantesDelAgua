import { Component, input } from '@angular/core';
import { Button } from 'ui-kit';
import { SECTION_IDS } from '../../content/section-ids';
import { ClosingCtaContent } from './closing-cta-content';

/**
 * Sección de cierre "Territorios que cuidan y aprenden" sobre el fondo verde
 * ondulado; destino del ancla "Contacto". El fondo continúa en el footer.
 */
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
