import { ClosingCtaContent } from '../sections/closing-cta/closing-cta-content';

const img = (name: string) => ({ src: `assets/images/${name}`, alt: '' });

// Copy tomado del Figma aprobado (Landing Desktop, componente "Contacto").
export const CLOSING_CTA_CONTENT: ClosingCtaContent = {
  heading: 'Territorios que cuidan\ny aprenden',
  paragraph:
    'Creemos en el conocimiento que nace del\nterritorio, en la colaboración y en las soluciones\nque regeneran la vida.',
  cta: { label: 'Hablemos', href: '#' }, // TODO: destino (mailto, formulario, WhatsApp...)
  divider: img('blueLine.svg'),
  background: img('contactBackground.svg'),
  illustrations: { left: img('footerLeft.webp'), right: img('footerRight.webp') },
};
