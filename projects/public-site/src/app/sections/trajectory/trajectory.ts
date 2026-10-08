import { Component, input, signal } from '@angular/core';
import { Button, CardPanel, CardPanelDefault, ExpandableCardGroup } from 'ui-kit';
import { SECTION_IDS } from '../../content/section-ids';
import { TrajectoryContent } from './trajectory-content';

/**
 * "Nuestra trayectoria": tarjetas Historia / Premios / Equipo con panel. El
 * panel de Premios tiene además un desglose con la descripción de cada año.
 */
@Component({
  selector: 'pub-trajectory',
  imports: [ExpandableCardGroup, CardPanel, CardPanelDefault, Button],
  templateUrl: './trajectory.html',
  styleUrl: './trajectory.scss',
})
export class Trajectory {
  readonly content = input.required<TrajectoryContent>();

  protected readonly sectionId = SECTION_IDS.trajectory;
  protected readonly awardsDetail = signal(false);
}
