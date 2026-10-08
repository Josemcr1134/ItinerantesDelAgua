import { Component, input } from '@angular/core';
import { ExpandableCardGroup } from 'ui-kit';
import { SECTION_IDS } from '../../content/section-ids';
import { CardGroupSectionContent } from '../../shared/card-group-section-content';

/** "Nuestra trayectoria": Historia / Premios y reconocimientos / Equipo. */
@Component({
  selector: 'pub-trajectory',
  imports: [ExpandableCardGroup],
  templateUrl: './trajectory.html',
  styleUrl: './trajectory.scss',
})
export class Trajectory {
  readonly content = input.required<CardGroupSectionContent>();

  protected readonly sectionId = SECTION_IDS.trajectory;
}
