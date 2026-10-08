import { UiImage } from '../models/image';

/** Tarjeta del grupo: ilustración, título y descripción corta. */
export interface ExpandableItem {
  readonly id: string;
  /** Ilustración (decorativa: `alt` vacío), centrada en una caja de 282px de alto. */
  readonly image: UiImage;
  /** Tamaño de la ilustración; por defecto 282×282. */
  readonly imageSize?: { readonly width: number; readonly height: number };
  readonly title: string;
  /** Admite saltos de línea (`\n`) para respetar los cortes del diseño. */
  readonly description: string;
}
