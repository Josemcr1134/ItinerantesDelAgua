import { TrajectoryContent } from '../sections/trajectory/trajectory-content';

const img = (name: string) => ({ src: `assets/images/${name}`, alt: '' });

// Copy tomado del Figma aprobado (Landing Desktop y componente "Component 7").
export const TRAJECTORY_CONTENT: TrajectoryContent = {
  heading: 'Nuestra trayectoria',
  subtitle:
    'Somos una empresa social que aprende del agua, diseña con la naturaleza y acompaña a los territorios hacia la regeneración.',
  divider: img('whiteLine.svg'),
  openLabel: 'Ver',
  closeLabel: 'Cerrar',
  items: [
    {
      id: 'historia',
      image: img('sculpture.png'),
      title: 'Historia',
      description: 'Conoce\nnuestro camino.',
    },
    {
      id: 'premios',
      image: img('sculptureWheelbarrow.png'),
      title: 'Premios y reconocimientos',
      description: 'Conoce\nnuestros logros.',
    },
    {
      id: 'equipo',
      image: img('ladyAndFlowers.png'),
      title: 'Equipo',
      description: 'Conoce a quiénes\nlo hacen posible',
    },
  ],
  // TODO(diseño): exportar desde Figma la ilustración del panel por defecto
  // (plantas, rocas y rana) a assets/images y enlazarla aquí.
  defaultIllustration: undefined,
  history: {
    title: 'Historia',
    paragraphs: [
      'Itinerantes del Agua es una organización que combina educación, diseño, innovación tecnológica y acción territorial para cuidar, tratar, captar, infiltrar y regenerar el agua desde una mirada basada en la naturaleza.',
      'Como el escarabajo pelotero, que construye su casa con residuos, nos inspira la capacidad de transformar. Aprendemos del agua, diseñamos con la naturaleza y regeneramos desde el territorio.',
    ],
    image: img('ecoBath.png'),
  },
  awards: {
    title: 'Premios y reconocimientos',
    timeline: img('timelineWave.svg'),
    showDetailLabel: 'Ver detalle de los premios',
    hideDetailLabel: 'Ocultar detalle de los premios',
    items: [
      {
        year: '2022',
        label: 'Innovación juvenil',
        description:
          'Iniciativa ganadora del premio internacional del Desafío Juvenil para la Innovación que otorga la Comisión para la Cooperación en América del Norte.',
        icon: img('2022.svg'),
      },
      {
        year: '2023',
        label: 'Soluciones hídricas',
        description:
          '1 de las 4 iniciativas seleccionadas del programa "Agua en positivo" de Makesense y Youth Water Solution por ser una solución a la crisis hídrica en México',
        icon: img('2023.svg'),
      },
      {
        year: '2024',
        label: 'Restauración ecológica',
        description:
          'Reconocida internacionalmente con el Restoration Fund Award del Global Land Programme',
        icon: img('2024.svg'),
      },
      {
        year: '2025',
        label: 'Regeneración marina',
        description:
          'Iniciativa seleccionada en el programa de fortalecimiento de emprendimientos rurales liderada por la Mesa de empleabilidad y juventud rural (MEEJR) en apoyo con Coopermodo y la embajada de Italia en Colombia',
        icon: img('2025.svg'),
      },
      {
        year: '2026',
        label: 'Liderazgos ambientales',
        description:
          'Iniciativa seleccionada para el programa SEMILLA - Semillero de Emprendimiento e Innovación para Liderazgos Locales, Ambientales y Juveniles de PNUD MX , Zurich México y Z Zurich Foundation',
        icon: img('2026.svg'),
      },
    ],
  },
  team: {
    title: 'Equipo',
    // TODO(contenido): cargos, nombres y retratos reales (el Figma usa
    // marcadores "Cargo" / "Nombre Apellido").
    members: [
      { role: 'CEO', name: 'Nombre Apellido' },
      { role: 'Cargo', name: 'Nombre Apellido' },
      { role: 'Cargo', name: 'Nombre Apellido' },
      { role: 'Cargo', name: 'Nombre Apellido' },
      { role: 'Cargo', name: 'Nombre Apellido' },
    ],
  },
  cta: { label: 'Conoce más', href: '#' }, // TODO: destino de "Conoce más"
};
