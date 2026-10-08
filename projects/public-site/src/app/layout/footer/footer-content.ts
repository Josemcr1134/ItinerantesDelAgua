import { UiImage } from 'ui-kit';

export interface SocialLink {
  /** Nombre accesible del enlace (ej. "Instagram de Itinerantes del Agua"). */
  readonly label: string;
  readonly href: string;
  readonly network: 'instagram';
}

export interface FooterContent {
  readonly logo: UiImage;
  readonly tagline: string;
  readonly socialLinks: readonly SocialLink[];
}
