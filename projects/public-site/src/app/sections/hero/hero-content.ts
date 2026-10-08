import { UiImage, UiLink } from 'ui-kit';

export interface HeroContent {
  readonly title: string;
  readonly subtitle: string;
  /** Palabras clave mostradas en una línea separadas por "·". */
  readonly keywords: readonly string[];
  readonly cta: UiLink;
  /** Indicador de scroll ("Desliza para explorar"). */
  readonly scrollHint: UiLink;
  /** Onda decorativa bajo el título. */
  readonly divider: UiImage;
  /** Ilustraciones decorativas a cada lado (`alt` vacío). */
  readonly illustrations: { readonly left: UiImage; readonly right: UiImage };
}
