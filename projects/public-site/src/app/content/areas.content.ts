import { AreasContent } from '../sections/areas/areas-content';

const CARD_IMAGE = { src: 'assets/placeholders/card-icon.svg', alt: '' }; // TODO(diseño)

// TODO(diseño/contenido): sección pendiente de implementar con el Figma.
export const AREAS_CONTENT: AreasContent = {
  heading: 'Itinerantes del Agua',
  subtitle: '[TODO: subtítulo de Itinerantes del Agua]',
  openLabel: 'Ver',
  closeLabel: 'Cerrar',
  items: [
    {
      id: 'escuela',
      image: CARD_IMAGE,
      title: 'Escuela Itinerante del Agua',
      description: '[TODO: descripción corta de la Escuela]',
      detail: {
        paragraphs: ['[TODO: contenido ampliado de la Escuela]'],
        columnsHeading: 'Nuestros caminos',
        columns: [
          { heading: '[TODO: camino 1]', items: ['[TODO]'] },
          { heading: '[TODO: camino 2]', items: ['[TODO]'] },
          { heading: '[TODO: camino 3]', items: ['[TODO]'] },
        ],
      },
    },
    {
      id: 'diseno-asesoria',
      image: CARD_IMAGE,
      title: 'Diseño y Asesoría',
      description: '[TODO: descripción corta de Diseño y Asesoría]',
      detail: { paragraphs: ['[TODO: contenido ampliado de Diseño y Asesoría]'] },
    },
    {
      id: 'innovacion',
      image: CARD_IMAGE,
      title: 'Innovación y Tecnologías Regenerativas',
      description: '[TODO: descripción corta de Innovación y Tecnologías Regenerativas]',
      detail: {
        paragraphs: ['[TODO: contenido ampliado de Innovación y Tecnologías Regenerativas]'],
      },
    },
  ],
};
