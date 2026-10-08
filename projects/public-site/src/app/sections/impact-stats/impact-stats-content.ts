import { UiStat } from 'ui-kit';

export interface ImpactStatsContent {
  readonly heading: string;
  /** Dato principal mostrado como badge. */
  readonly highlight: UiStat;
  /** Fila de círculos de estadística (el diseño muestra 3). */
  readonly stats: readonly UiStat[];
}
