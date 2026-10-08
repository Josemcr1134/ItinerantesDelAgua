import { UiImage } from 'ui-kit';

export interface ClosingCtaContent {
  readonly heading: string;
  readonly paragraph: string;
  /** Botón que muestra el formulario de contacto en lugar del bloque. */
  readonly ctaLabel: string;
  /** Botón del formulario para volver al bloque inicial. */
  readonly backLabel: string;
  readonly divider: UiImage;
  /** Fondo verde con borde superior ondulado (1440×781). */
  readonly background: UiImage;
  /** Ilustraciones decorativas que asoman sobre la sección anterior. */
  readonly illustrations: { readonly left: UiImage; readonly right: UiImage };
}
