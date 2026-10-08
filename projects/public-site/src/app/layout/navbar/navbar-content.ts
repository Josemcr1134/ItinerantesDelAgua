import { UiImage, UiLink } from 'ui-kit';

export interface NavbarContent {
  readonly skipLinkLabel: string;
  /** Logo; su `alt` es el nombre accesible del enlace al inicio. */
  readonly logo: UiImage;
  /** Ancla del inicio de la página, destino del logo. */
  readonly homeHref: string;
  readonly navLabel: string;
  readonly links: readonly UiLink[];
  readonly cta: UiLink;
  readonly menuOpenLabel: string;
  readonly menuCloseLabel: string;
}
