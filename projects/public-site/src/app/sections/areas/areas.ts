import { Component, input } from '@angular/core';
import { ExpandableCardGroup } from 'ui-kit';
import { SECTION_IDS } from '../../content/section-ids';
import { CardGroupSectionContent } from '../../shared/card-group-section-content';

/** "Itinerantes del Agua": áreas del ecosistema. */
@Component({
  selector: 'pub-areas',
  imports: [ExpandableCardGroup],
  templateUrl: './areas.html',
  styleUrl: './areas.scss',
})
export class Areas {
  readonly content = input.required<CardGroupSectionContent>();

  protected readonly sectionId = SECTION_IDS.areas;
}
