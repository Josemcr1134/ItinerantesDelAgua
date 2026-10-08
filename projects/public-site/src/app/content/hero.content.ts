import { HeroContent } from '../sections/hero/hero-content';
import { SECTION_IDS } from './section-ids';

// TODO(contenido): reemplazar todos los textos [TODO ...] por el copy final.
export const HERO_CONTENT: HeroContent = {
  title: '[TODO: título del hero]',
  subtitle: '[TODO: subtítulo del hero]',
  keywords: ['[TODO palabra 1]', '[TODO palabra 2]', '[TODO palabra 3]'],
  cta: {
    label: '[TODO: CTA primario]',
    href: '#', // TODO: confirmar destino del CTA del hero
  },
  scrollHint: {
    label: 'Ir a la siguiente sección',
    href: `#${SECTION_IDS.objectives}`,
  },
  background: {
    src: 'assets/placeholders/hero-background.svg', // TODO(diseño): ilustración real
    alt: '',
  },
};
