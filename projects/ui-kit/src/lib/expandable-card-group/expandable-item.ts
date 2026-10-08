import { UiImage } from '../models/image';
import { UiLink } from '../models/link';

/** Columna de lista dentro del panel de detalle (ej. "Nuestros caminos"). */
export interface ExpandableDetailColumn {
  readonly heading: string;
  readonly items: readonly string[];
}

/** Contenido ampliado que se muestra en el panel al expandir una tarjeta. */
export interface ExpandableItemDetail {
  readonly paragraphs: readonly string[];
  readonly columnsHeading?: string;
  readonly columns?: readonly ExpandableDetailColumn[];
  readonly cta?: UiLink;
}

/** Tarjeta del grupo: resumen visible + detalle expandible. */
export interface ExpandableItem {
  readonly id: string;
  readonly icon: UiImage;
  readonly title: string;
  readonly description: string;
  readonly detail: ExpandableItemDetail;
}
