import { Component, input } from '@angular/core';
import { CardPanel, ExpandableCardGroup } from 'ui-kit';
import { SECTION_IDS } from '../../content/section-ids';
import { AreasContent } from './areas-content';

/** "Itinerantes del Agua": áreas del ecosistema. */
@Component({
  selector: 'pub-areas',
  imports: [ExpandableCardGroup, CardPanel],
  templateUrl: './areas.html',
  styleUrl: './areas.scss',
})
export class Areas {
  readonly content = input.required<AreasContent>();

  protected readonly sectionId = SECTION_IDS.areas;
}
