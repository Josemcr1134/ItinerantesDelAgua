import { ClosingCtaContent } from '../sections/closing-cta/closing-cta-content';

const img = (name: string) => ({ src: `assets/images/${name}`, alt: '' });

// Copy tomado del Figma aprobado (Landing Desktop, componente "Contacto").
export const CLOSING_CTA_CONTENT: ClosingCtaContent = {
  heading: 'Territorios que cuidan\ny aprenden',
  paragraph:
    'Creemos en el conocimiento que nace del\nterritorio, en la colaboración y en las soluciones\nque regeneran la vida.',
  ctaLabel: 'Hablemos',
  form: {
    emailLabel: 'Correo',
    emailPlaceholder: 'Escribe tu correo',
    messageLabel: 'Mensaje',
    messagePlaceholder: 'Escribe tu mensaje aquí',
    submitLabel: 'Enviar',
    backLabel: 'Volver',
    // TODO(contenido): confirmar los textos de estados y errores (no están en el Figma).
    sendingLabel: 'Enviando…',
    errors: {
      emailRequired: 'Escribe tu correo.',
      emailInvalid: 'Escribe un correo válido, por ejemplo nombre@dominio.com.',
      messageRequired: 'Escribe tu mensaje.',
    },
    successMessage: '¡Gracias! Recibimos tu mensaje.',
    failureMessage: 'No pudimos enviar tu mensaje. Inténtalo de nuevo más tarde.',
  },
  divider: img('blueLine.svg'),
  background: img('contactBackground.svg'),
  illustrations: { left: img('footerLeft.webp'), right: img('footerRight.webp') },
};
