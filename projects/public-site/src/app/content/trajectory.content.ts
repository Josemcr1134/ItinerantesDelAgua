import { CardGroupSectionContent } from '../shared/card-group-section-content';

const CARD_ICON = 'images/placeholders/card-icon.svg'; // TODO(diseño): íconos reales por tarjeta

// TODO(contenido): subtítulo, descripciones y detalle reales (equipo, premios).
export const TRAJECTORY_CONTENT: CardGroupSectionContent = {
  heading: 'Nuestra trayectoria',
  subtitle: '[TODO: subtítulo de Nuestra trayectoria]',
  collapseLabel: 'Cerrar', // TODO(contenido): confirmar texto del botón
  items: [
    {
      id: 'historia',
      icon: { src: CARD_ICON, alt: '' },
      title: 'Historia',
      description: '[TODO: descripción corta de Historia]',
      detail: {
        paragraphs: ['[TODO: contenido ampliado de Historia]'],
        cta: { label: 'Conoce más', href: '#' }, // TODO: destino del CTA
      },
    },
    {
      id: 'premios',
      icon: { src: CARD_ICON, alt: '' },
      title: 'Premios y reconocimientos',
      description: '[TODO: descripción corta de Premios y reconocimientos]',
      detail: {
        paragraphs: ['[TODO: contenido ampliado de Premios y reconocimientos]'],
        cta: { label: 'Conoce más', href: '#' }, // TODO: destino del CTA
      },
    },
    {
      id: 'equipo',
      icon: { src: CARD_ICON, alt: '' },
      title: 'Equipo',
      description: '[TODO: descripción corta de Equipo]',
      detail: {
        paragraphs: ['[TODO: contenido ampliado de Equipo]'],
        cta: { label: 'Conoce más', href: '#' }, // TODO: destino del CTA
      },
    },
  ],
};
