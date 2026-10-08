import { UiImage } from 'ui-kit';

export interface SocialLink {
  /** Nombre accesible del enlace (ej. "Instagram de Itinerantes del Agua"). */
  readonly label: string;
  readonly href: string;
  /** Ícono decorativo; el nombre accesible lo da `label`. */
  readonly iconSrc: string;
}

export interface FooterContent {
  readonly logo: UiImage;
  readonly tagline: string;
  readonly socialLinks: readonly SocialLink[];
}
