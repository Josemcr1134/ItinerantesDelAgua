import { ExpandableItem, UiImage, UiLink } from 'ui-kit';

export interface Award {
  readonly year: string;
  readonly label: string;
  readonly description: string;
  /** Ícono circular de 79×79 (decorativo). */
  readonly icon: UiImage;
}

export interface TeamMember {
  readonly role: string;
  readonly name: string;
  /** Retrato circular; sin foto se muestra solo el círculo amarillo. */
  readonly photo?: UiImage;
}

export interface TrajectoryContent {
  readonly heading: string;
  readonly subtitle: string;
  readonly divider: UiImage;
  /** Prefijos del nombre accesible de los botones-pestaña. */
  readonly openLabel: string;
  readonly closeLabel: string;
  /** Tarjetas en orden: historia, premios, equipo. */
  readonly items: readonly ExpandableItem[];
  /** Ilustración del panel cuando no hay tarjeta activa. */
  readonly defaultIllustration?: UiImage;
  readonly history: {
    readonly title: string;
    readonly paragraphs: readonly string[];
    readonly image: UiImage;
  };
  readonly awards: {
    readonly title: string;
    readonly items: readonly Award[];
    readonly timeline: UiImage;
    readonly showDetailLabel: string;
    readonly hideDetailLabel: string;
  };
  readonly team: {
    readonly title: string;
    readonly members: readonly TeamMember[];
  };
  readonly cta: UiLink;
}
