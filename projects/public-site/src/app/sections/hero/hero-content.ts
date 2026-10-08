import { UiImage, UiLink } from 'ui-kit';

export interface HeroContent {
  readonly title: string;
  readonly subtitle: string;
  /** Palabras clave mostradas en una línea separadas por "·". */
  readonly keywords: readonly string[];
  readonly cta: UiLink;
  /** Indicador de scroll: su `label` es solo para lectores de pantalla. */
  readonly scrollHint: UiLink;
  /** Ilustración de fondo; `alt` vacío porque es decorativa. */
  readonly background: UiImage;
}
