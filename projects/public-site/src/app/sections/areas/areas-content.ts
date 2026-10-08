import { ExpandableItem, UiLink } from 'ui-kit';

/** Columna de lista del panel (ej. "Nuestros caminos"). */
export interface AreaColumn {
  readonly heading: string;
  readonly items: readonly string[];
}

/** Contenido del panel de cada área. */
export interface AreaDetail {
  readonly paragraphs: readonly string[];
  readonly columnsHeading?: string;
  readonly columns?: readonly AreaColumn[];
  readonly cta?: UiLink;
}

export interface AreasContent {
  readonly heading: string;
  readonly subtitle: string;
  readonly openLabel: string;
  readonly closeLabel: string;
  readonly items: readonly (ExpandableItem & { readonly detail: AreaDetail })[];
}
