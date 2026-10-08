import { UiImage, UiLink } from 'ui-kit';

export interface ClosingCtaContent {
  readonly heading: string;
  readonly paragraph: string;
  readonly cta: UiLink;
  readonly divider: UiImage;
  /** Fondo verde con borde superior ondulado (1440×781). */
  readonly background: UiImage;
  /** Ilustraciones decorativas que asoman sobre la sección anterior. */
  readonly illustrations: { readonly left: UiImage; readonly right: UiImage };
}
