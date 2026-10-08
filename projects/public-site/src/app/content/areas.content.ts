import { CardGroupSectionContent } from '../shared/card-group-section-content';

const CARD_ICON = 'assets/placeholders/card-icon.svg'; // TODO(diseño): íconos reales por tarjeta

// TODO(contenido): subtítulo, descripciones y detalle reales de cada área.
export const AREAS_CONTENT: CardGroupSectionContent = {
  heading: 'Itinerantes del Agua',
  subtitle: '[TODO: subtítulo de Itinerantes del Agua]',
  collapseLabel: 'Cerrar', // TODO(contenido): confirmar texto del botón
  items: [
    {
      id: 'escuela',
      icon: { src: CARD_ICON, alt: '' },
      title: 'Escuela Itinerante del Agua',
      description: '[TODO: descripción corta de la Escuela]',
      detail: {
        paragraphs: ['[TODO: contenido ampliado de la Escuela]'],
        // TODO(contenido): confirmar en qué tarjeta(s) va el bloque de columnas.
        columnsHeading: 'Nuestros caminos',
        columns: [
          { heading: '[TODO: camino 1]', items: ['[TODO]'] },
          { heading: '[TODO: camino 2]', items: ['[TODO]'] },
          { heading: '[TODO: camino 3]', items: ['[TODO]'] },
        ],
        cta: { label: 'Conoce más', href: '#' }, // TODO: destino del CTA
      },
    },
    {
      id: 'diseno-asesoria',
      icon: { src: CARD_ICON, alt: '' },
      title: 'Diseño y Asesoría',
      description: '[TODO: descripción corta de Diseño y Asesoría]',
      detail: {
        paragraphs: ['[TODO: contenido ampliado de Diseño y Asesoría]'],
        cta: { label: 'Conoce más', href: '#' }, // TODO: destino del CTA
      },
    },
    {
      id: 'innovacion',
      icon: { src: CARD_ICON, alt: '' },
      title: 'Innovación y Tecnologías Regenerativas',
      description: '[TODO: descripción corta de Innovación y Tecnologías Regenerativas]',
      detail: {
        paragraphs: ['[TODO: contenido ampliado de Innovación y Tecnologías Regenerativas]'],
        cta: { label: 'Conoce más', href: '#' }, // TODO: destino del CTA
      },
    },
  ],
};
