import { UiImage, UiStat } from 'ui-kit';

/** Cifra de la sección; `key` la vincula con `GET /site/metrics`. */
export interface ImpactStat extends UiStat {
  /** Clave de la cifra en la API (p. ej. `PEOPLE_TRAINED`). */
  readonly key?: string;
}

export interface ImpactStatsContent {
  readonly heading: string;
  /** Onda decorativa sobre el titular. */
  readonly divider: UiImage;
  /** Dato principal mostrado como badge (`null` si el equipo lo oculta). */
  readonly highlight: ImpactStat | null;
  /** Trazo a mano que rodea el dato principal (decorativo). */
  readonly highlightOutline: UiImage;
  /** Tarjetas con anillo de progreso (el diseño muestra 3). */
  readonly stats: readonly ImpactStat[];
  /** Forma orgánica de fondo de cada tarjeta (decorativa). */
  readonly cardShape: UiImage;
}
