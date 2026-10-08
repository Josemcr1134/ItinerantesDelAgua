import { UiImage, UiStat } from 'ui-kit';

export interface ImpactStatsContent {
  readonly heading: string;
  /** Onda decorativa sobre el titular. */
  readonly divider: UiImage;
  /** Dato principal mostrado como badge. */
  readonly highlight: UiStat;
  /** Trazo a mano que rodea el dato principal (decorativo). */
  readonly highlightOutline: UiImage;
  /** Tarjetas con anillo de progreso (el diseño muestra 3). */
  readonly stats: readonly UiStat[];
  /** Forma orgánica de fondo de cada tarjeta (decorativa). */
  readonly cardShape: UiImage;
}
