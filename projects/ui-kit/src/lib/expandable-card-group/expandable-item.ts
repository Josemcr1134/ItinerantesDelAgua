import { UiImage } from '../models/image';

/** Tarjeta del grupo: ilustración, título y descripción corta. */
export interface ExpandableItem {
  readonly id: string;
  /** Ilustración de 282×282 (decorativa: `alt` vacío). */
  readonly image: UiImage;
  readonly title: string;
  /** Admite saltos de línea (`\n`) para respetar los cortes del diseño. */
  readonly description: string;
}
