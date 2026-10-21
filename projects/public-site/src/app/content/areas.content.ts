import { AreasContent } from '../sections/areas/areas-content';

const img = (name: string) => ({ src: `assets/images/${name}`, alt: '' });

// Copy tomado del Figma aprobado (Landing Desktop y paneles de cada área).
export const AREAS_CONTENT: AreasContent = {
  heading: 'Itinerantes del Agua',
  subtitle:
    'Integramos educación, acompañamiento técnico y ecotecnologías para fortalecer la relación entre comunidades, territorios y agua.',
  divider: img('blueLine.svg'),
  openLabel: 'Ver',
  closeLabel: 'Cerrar',
  initialItemId: 'escuela',
  items: [
    {
      id: 'escuela',
      image: img('snake.webp'),
      backdrop: '#d8e7fb', // forma de fondo en móvil (azul)
      title: 'Escuela Itinerante del Agua',
      description: 'Aprende soluciones basadas\nen la naturaleza para revitalizar\nel agua.',
      cta: { label: 'Conoce la Escuela', href: '#' }, // TODO: destino
    },
    {
      id: 'diseno',
      image: img('flowerpotAndFlowers.webp'),
      backdrop: '#e3e5d6', // forma de fondo en móvil (salvia)
      title: 'Diseño y Asesoría',
      description: 'Diseñamos soluciones\nadaptadas a las necesidades\nde cada proyecto.',
      // TODO(contenido): ¿lleva botón bajo el panel? (no está en el Figma)
    },
    {
      id: 'innovacion',
      image: img('ecoBath.webp'),
      backdrop: '#fbebc9', // forma de fondo en móvil (amarillo)
      imageSize: { width: 404, height: 194 },
      title: 'Innovación y tecnologías\nregenerativas',
      description:
        'Convertimos el conocimiento en\nsoluciones vivas para tratar, captar,\ninfiltrar y regenerar el agua.',
      // TODO(contenido): ¿lleva botón bajo el panel? (no está en el Figma)
    },
  ],
  // Los `\n` de las listas reproducen los saltos de línea manuales del Figma.
  school: {
    title: 'Escuela Itinerante del Agua',
    subtitle: 'Cambiando la relación con el agua',
    paragraphs: [
      {
        lead: 'Nuestra Misión:',
        text: 'Descentralizar y promover el acceso a ecotecnologías para el tratamiento de aguas jabonosas en comunidades rurales de Latinoamérica. Impulsando la formación de niñas, niños y jóvenes para mejorar la calidad de vida de sus comunidades; desarrollando estrategias de resiliencia comunitaria frente al cambio climático.',
      },
      {
        text: 'Combinamos educación, diseño, innovación tecnológica y acción territorial para desarrollar y compartir soluciones que permitan cuidar, tratar, captar, infiltrar y regenerar el agua desde una mirada basada en la naturaleza.',
      },
    ],
    image: img('ladyOnTheRock.webp'),
    pathsTitle: 'Nuestros caminos',
    paths: [
      {
        heading: 'Formación especializada',
        items: [
          'Diplomado en\nEcotecnologías del Agua.',
          'Diplomado de\nEcopedagogías.',
          'Escuela de Aprendices\ndel Agua.',
        ],
      },
      {
        heading: 'Cursos y talleres online',
        items: [
          'Introducción a los sistemas de tratamiento de aguas',
          'Humedales construidos',
          'Baños secos',
          'Captación y cosecha de agua',
        ],
      },
      {
        heading: 'Aprendizaje práctico',
        items: [
          'Laboratorios Itinerantes\ndel agua',
          'Prácticas territoriales',
          'Visitas y experiencias de campo',
        ],
      },
    ],
  },
  design: {
    title: 'Diseño y Asesoría',
    subtitle: 'Diseñar soluciones adaptadas a cada territorio.',
    paragraph:
      'Implementamos soluciones basadas en la naturaleza para la transición climática a nivel domiciliario y comercial. Acompañamos a espacios y proyectos colectivos, organizaciones o proyectos productivos que desean integrar sistemas regenerativos de agua: captación de lluvia, rehidratación del paisaje o tratamiento de aguas residuales. Partimos de las condiciones del territorio para integrar procesos naturales, conocimientos técnicos y tecnologías apropiadas.',
    image: img('flowerpotAndFlowers.webp'),
    servicesTitle: '¿Qué hacemos?',
    services: [
      'Diseño de sistemas de tratamiento de aguas residuales',
      'Diseño de sistemas de captación de lluvias',
      'Diseño de sistemas de infiltración y rehidratación del paisaje',
      'Diagnósticos y estrategias para la resiliencia hídrica',
      'Asesoría para implementación de tecnologías',
    ],
  },
  innovation: {
    title: 'Innovación y tecnologías regenerativas',
    subtitle: 'Desarrollar e implementar soluciones basadas en la naturaleza.',
    paragraph:
      'Creamos tecnologías para que el agua vuelva a ser parte de los ciclos vivos: investigación, diseño, conocimientos locales y experimentación para captar, tratar, aprovechar y reintegrar el agua al territorio.',
    linesTitle: 'Nuestras líneas de innovación',
    lines: [
      {
        heading: 'Captación y manejo del agua',
        text: 'Sistemas para captar, almacenar, infiltrar y aprovechar el agua de lluvia.',
      },
      {
        heading: 'Tratamiento de aguas',
        text: 'Tecnologías vivas para el tratamiento descentralizado de aguas grises y negras.',
      },
      {
        heading: 'Regeneración del paisaje',
        text: 'Soluciones para recuperar los ciclos del agua y rehidratar los territorios.',
      },
    ],
    featured: {
      title: 'HAWA',
      subtitle: 'Biofiltro para el tratamiento de aguas grises',
      paragraphs: [
        'Tecnología de Itinerantes del Agua para el tratamiento descentralizado de aguas grises con procesos naturales de filtración y depuración, para espacios domésticos, educativos y comunitarios.',
        '¿Cómo podemos tratar el agua dentro de nuestros propios espacios y devolverla al territorio de manera regenerativa?',
      ],
      items: [
        'Procesos naturales de depuración',
        'Filtración de aguas grises',
        'Diseño para espacios descentralizados',
        'Reutilización y aprovechamiento del agua',
        'Investigación y experimentación',
        'Adaptación a diferentes contextos territoriales',
      ],
    },
  },
};
