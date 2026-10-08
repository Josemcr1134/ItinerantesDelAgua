import { Component, input } from '@angular/core';
import { StatBadge, StatCircle } from 'ui-kit';
import { SECTION_IDS } from '../../content/section-ids';
import { ImpactStatsContent } from './impact-stats-content';

/** Sección de impacto/métricas ("Objetivos"): dato destacado + círculos. */
@Component({
  selector: 'pub-impact-stats',
  imports: [StatBadge, StatCircle],
  templateUrl: './impact-stats.html',
  styleUrl: './impact-stats.scss',
})
export class ImpactStats {
  readonly content = input.required<ImpactStatsContent>();

  protected readonly sectionId = SECTION_IDS.objectives;
}
