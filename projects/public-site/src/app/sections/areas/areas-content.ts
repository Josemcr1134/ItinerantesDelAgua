import { ExpandableItem, UiImage, UiLink } from 'ui-kit';

/** Párrafo con un inicio opcional en negrita ("Nuestra Misión:"). */
export interface RichParagraph {
  readonly lead?: string;
  readonly text: string;
}

export interface AreaItem extends ExpandableItem {
  /** Botón bajo el panel cuando esta área está activa. */
  readonly cta?: UiLink;
}

export interface AreasContent {
  readonly heading: string;
  readonly subtitle: string;
  readonly divider: UiImage;
  readonly openLabel: string;
  readonly closeLabel: string;
  /** Área abierta al cargar la página. */
  readonly initialItemId?: string;
  /** Tarjetas en orden: escuela, diseno, innovacion. */
  readonly items: readonly AreaItem[];
  readonly school: {
    readonly title: string;
    readonly subtitle: string;
    readonly paragraphs: readonly RichParagraph[];
    readonly image: UiImage;
    readonly pathsTitle: string;
    readonly paths: readonly { readonly heading: string; readonly items: readonly string[] }[];
  };
  readonly design: {
    readonly title: string;
    readonly subtitle: string;
    readonly paragraph: string;
    readonly image: UiImage;
    readonly servicesTitle: string;
    readonly services: readonly string[];
  };
  readonly innovation: {
    readonly title: string;
    readonly subtitle: string;
    readonly paragraph: string;
    readonly linesTitle: string;
    readonly lines: readonly { readonly heading: string; readonly text: string }[];
    readonly featured: {
      readonly title: string;
      readonly subtitle: string;
      readonly paragraphs: readonly string[];
      readonly items: readonly string[];
    };
  };
}
