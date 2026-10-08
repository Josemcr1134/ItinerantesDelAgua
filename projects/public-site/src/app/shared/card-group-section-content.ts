import { ExpandableItem } from 'ui-kit';

/** Contenido de una sección con grupo de tarjetas expandibles (trayectoria, áreas). */
export interface CardGroupSectionContent {
  readonly heading: string;
  readonly subtitle: string;
  /** Texto del botón que colapsa el panel de detalle. */
  readonly collapseLabel: string;
  readonly items: readonly ExpandableItem[];
}
